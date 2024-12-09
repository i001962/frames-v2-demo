/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, { FrameContext, FrameNotificationDetails } from "@farcaster/frame-sdk";
import Image from "next/image";
import RAGameContext from "./RAGameContext";
import { Button } from "~/components/ui/Button";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export default function Demo({ title = "d33m" }: { title?: string }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [context, setContext] = useState<FrameContext>();
  const [isContextOpen, setIsContextOpen] = useState(true); // Start with the context expanded
  const [apiResponse, setApiResponse] = useState<any>(null); // State to store API response from ESPN API
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [error, setError] = useState<string | null>(null); // State to handle error if any
  const [selectedMatch, setSelectedMatch] = useState<any>(null); // Store selected match with team logos, scores, etc.
  const [gameContext, setGameContext] = useState<any>(null); // State to store the game context data
  const [addFrameResult, setAddFrameResult] = useState("");
  const [notificationDetails, setNotificationDetails] = useState<FrameNotificationDetails | null>(null);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [sendNotificationResult, setSendNotificationResult] = useState("");

  const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'; // ESPN Soccer API endpoint

  useEffect(() => {
    const load = async () => {
      const ctx = await sdk.context;
      setContext(ctx);
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  // Trigger the API call when the page loads or the context is toggled
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading before the fetch request
      setError(null); // Reset any previous errors

      try {
        const response = await fetch(apiUrl); // Call ESPN Soccer API
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setApiResponse(data); // Store the API response in state
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message); // Access the `message` property safely
        } else {
          setError('An unknown error occurred'); // Fallback error message if `err` isn't an instance of `Error`
        }      
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData(); // Call the function to fetch the data
  }, []); // This effect runs only on the initial render

  // Fetch the game context based on the home and away teams
  const fetchGameContext = (homeTeam: string, awayTeam: string) => {
    setGameContext(null); // Clear the game context when a new match is selected
    setLoading(true); // Show the loading state

    const eventId = `${homeTeam}${awayTeam}`; // Concatenate home and away team to create eventId
    RAGameContext(eventId) // Call the RAGameContext function
      .then((data) => {
        setGameContext(data); // Store the game context data
        setLoading(false); // Hide loading after the context is retrieved
      })
      .catch((err) => {
        setGameContext("Failed to fetch game context " + eventId); // Store the error message
        setLoading(false); // Hide loading after the error
        console.error("Failed to fetch game context", err);
      });
  };

  const toggleContext = useCallback(() => {
    setIsContextOpen(prev => !prev);
  }, []); // No conditional logic here

  const sendNotification = useCallback(async () => {
    setSendNotificationResult("");
    if (!notificationDetails) {
      return;
    }

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: notificationDetails.token,
          url: notificationDetails.url,
          targetUrl: window.location.href,
        }),
      });

      if (response.status === 200) {
        setSendNotificationResult("Success");
        return;
      }

      const data = await response.text();
      setSendNotificationResult(`Error: ${data}`);
    } catch (error) {
      setSendNotificationResult(`Error: ${error}`);
    }
  }, [notificationDetails]);
  
  const addFrame = useCallback(async () => {
    try {
      // setAddFrameResult("");
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.added) {
        if (result.notificationDetails) {
          setNotificationDetails(result.notificationDetails);
        }
        setAddFrameResult(
          result.notificationDetails
            ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
            : "Added, got no notification details"
        );
        sendNotification();
      } else {
        setAddFrameResult(`Not added: ${result.reason}`);
      }
    } catch (error) {
      setAddFrameResult(`Error: ${error}`);
    }
  }, [sendNotification]);

  // Button to trigger external URL when clicked
  const castSummary = useCallback(() => {
    if (selectedMatch) {
      const { competitors, homeTeam, awayTeam, homeScore, awayScore, clock, homeLogo, awayLogo } = selectedMatch;
      const matchSummary = `${competitors}\n${homeTeam.toUpperCase()} ${homeScore} ${awayTeam.toUpperCase()} ${awayScore}\n${clock}\n\nUsing the d33m live match mini-app d33m-frames-v2.vercel.app cc @kmacb.eth `;
      const encodedSummary = encodeURIComponent(matchSummary);
      const url = `https://warpcast.com/~/compose?text=${encodedSummary}&channelKey=football&embeds[]=${homeLogo}&embeds[]=${awayLogo}`;

      console.log("Opening URL:", url); // Log the URL for debugging
      sdk.actions.openUrl(url); // Open the constructed URL
    } else {
      console.log("No match selected");
    }
  }, [selectedMatch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderEvent = (event: any) => {
    console.log("Event data:", event);  
    const homeTeam = event.shortName.split('@')[1].trim().toLowerCase();
    const awayTeam = event.shortName.split('@')[0].trim().toLowerCase();
    const competitors = event.name;
    const eventTime = new Date(event.date);
    const scores = event.competitions[0]?.competitors.map((c: any) => c.score).join('  -  ');
    const eventStarted = new Date() >= new Date(event.date);
    const dateTimeString = eventTime.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' }) + 
      ' ' + eventTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const clock = event.status.displayClock + ' ' + event.status.type.detail || '00:00'; // Get the display clock or default to '00:00'

    // Get team logos for the selected match
    const homeTeamLogo = event.competitions[0]?.competitors[0]?.team.logo;
    const awayTeamLogo = event.competitions[0]?.competitors[1]?.team.logo;
    const homeScore = event.competitions[0]?.competitors[0]?.score;
    const awayScore = event.competitions[0]?.competitors[1]?.score;

    return (
      <div key={event.id} className="sidebar">
        <div className="dropdown-content">
          <div className="hover:bg-deepPink cursor-pointer">
            <button
              onClick={() => {
                setSelectedMatch({
                  homeTeam: `${homeTeam}`,
                  awayTeam: `${awayTeam}`,
                  competitors: competitors,
                  homeLogo: homeTeamLogo,
                  awayLogo: awayTeamLogo,
                  homeScore: homeScore,
                  awayScore: awayScore,
                  clock: clock,
                }); // Store the selected match along with team logos and scores
                fetchGameContext(homeTeam, awayTeam); // Fetch game context when a match is tapped
                toggleContext(); // Close the context when a match is tapped
              }}
              className="dropdown-button cursor-pointer flex items-center mb-2 w-full"
            >
              <span className="mt-2 mb-2 flex flex-grow items-center ml-2 mr-2">
                <Image
                  src={homeTeamLogo || '/assets/defifa_spinner.gif'}
                  alt="Home Team Logo"
                  className="w-8 h-8"
                  width={20}
                  height={20}
                  style={{ marginRight: '8px' }}
                />
                {homeTeam} vs {awayTeam}
                <Image
                  src={awayTeamLogo || '/assets/defifa_spinner.gif'}
                  alt="Away Team Logo"
                  className="w-8 h-8"
                  width={20}
                  height={20}
                  style={{ marginRight: '8px' }}
                />
              </span>
              <span className="m-2 text-sm font-semibold">
                {eventStarted ? scores : dateTimeString}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isSDKLoaded) return <div>Waiting for VAR...</div>;

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      {/* <h1 className="text-2xl font-bold text-center text-notWhite mb-4">{title}</h1> */}
      <div className="mb-4">
        <h2 className="font-2xl font-bold"></h2>
        <button onClick={toggleContext} className="flex items-center gap-2 transition-colors text-lightPurple">
          <span className={`transform transition-transform ${isContextOpen ? "rotate-90" : ""}`}>➤</span>
          {selectedMatch ? (
            <div className="flex items-center">
              <Image
                src={selectedMatch.homeLogo || '/assets/defifa_spinner.gif'}
                alt="Home Team Logo"
                className="w-8 h-8"
                width={20}
                height={20}
                style={{ marginRight: '8px' }}
              />
              {selectedMatch.homeTeam} vs {selectedMatch.awayTeam} - {selectedMatch.homeScore} : {selectedMatch.awayScore}
              <Image
                src={selectedMatch.awayLogo || '/assets/defifa_spinner.gif'}
                alt="Away Team Logo"
                className="w-8 h-8"
                width={20}
                height={20}
                style={{ marginLeft: '8px' }}
              />
            </div>
          ) : "Select a match"}
        </button>
        {isContextOpen && (
          <div className="p-4 mt-2 bg-purplePanel text-lightPurple rounded-lg">
            {loading ? (
              <div>Loading data...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : apiResponse ? (
              apiResponse.events.map((event: any) => renderEvent(event)) // Render events from API response
            ) : (
              <div>No data available.</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-lightPurple bg-purplePanel">
        <h2 className="font-2xl text-notWhite font-bold">Match Summary</h2>
        {gameContext ? (
          <div className="p-4 bg-purplePanel text-lightPurple rounded-lg">
            <pre className="text-sm whitespace-pre-wrap break-words">{gameContext}</pre>
            {/* Conditionally render the Cast button when the game context is available */}
          
            <div className="mt-4">
              <Button onClick={castSummary}>Cast</Button>
            </div>
            <div className="mt-4">
              {addFrameResult && (
                <div className="mb-2 text-fontRed">Add app result: {addFrameResult}</div>
              )}
              <Button onClick={addFrame}>Add app</Button>
            </div>
          </div>
        ) : loading ? (
          <div>Loading match context is like waiting for VAR...</div> // Display loading message while context is being fetched
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
