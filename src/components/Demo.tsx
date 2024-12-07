/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, { FrameContext } from "@farcaster/frame-sdk";
import Image from "next/image";
import RAGameContext from "./RAGameContext";

export default function Demo({ title = "d33m EPL" }: { title?: string }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [isContextOpen, setIsContextOpen] = useState(true); // Start with the context expanded
  const [apiResponse, setApiResponse] = useState<any>(null); // State to store API response from ESPN API
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [error, setError] = useState<string | null>(null); // State to handle error if any
  const [selectedMatch, setSelectedMatch] = useState<any>(null); // Store selected match with team logos
  const [gameContext, setGameContext] = useState<any>(null); // State to store the game context data

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
        setError(err.message); // Handle any errors that occurred during the fetch
      } finally {
        setLoading(false); // End loading
      }
    };

    // Fetch the data when the component loads
    fetchData();
  }, []);

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

  const toggleContext = useCallback(async () => {
    setIsContextOpen(prev => !prev);
  }, []);

  const renderEvent = (event: any) => {
    const homeTeam = event.shortName.split('@')[1].trim().toLowerCase();
    const awayTeam = event.shortName.split('@')[0].trim().toLowerCase();
    const eventTime = new Date(event.date);
    const scores = event.competitions[0]?.competitors.map((c: any) => c.score).join('  -  ');
    const eventStarted = new Date() >= new Date(event.date);
    const dateTimeString = eventTime.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' }) + 
      ' ' + eventTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Get team logos for the selected match
    const homeTeamLogo = event.competitions[0]?.competitors[0]?.team.logo;
    const awayTeamLogo = event.competitions[0]?.competitors[1]?.team.logo;

    return (
      <div key={event.id} className="sidebar">
        <div className="dropdown-content">
          <div className="hover:bg-deepPink cursor-pointer">
            <button
              onClick={() => {
                setSelectedMatch({
                  homeTeam: `${homeTeam}`,
                  awayTeam: `${awayTeam}`,
                  homeLogo: homeTeamLogo,
                  awayLogo: awayTeamLogo,
                }); // Store the selected match along with team logos
                fetchGameContext(homeTeam, awayTeam); // Fetch game context when a match is tapped
                toggleContext(); // Close the context when a match is tapped
              }}
              className="dropdown-button cursor-pointer flex items-center mb-2 w-full"
            >
              <span className="mt-2 mb-2 flex flex-grow items-center ml-2 mr-2 text-notWhite">
                <Image
                  src={homeTeamLogo || '/assets/defifa_spinner.gif'}
                  alt="Home Team Logo"
                  className="w-8 h-8"
                  width={20}
                  height={20}
                  style={{ marginRight: '8px' }}
                />
                {homeTeam} v {awayTeam}
                <Image
                  src={awayTeamLogo || '/assets/defifa_spinner.gif'}
                  alt="Away Team Logo"
                  className="w-8 h-8"
                  width={20}
                  height={20}
                  style={{ marginRight: '8px' }}
                />
              </span>
              <span className="ml-2 text-sm text-lightPurple font-semibold">
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
      <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

      <div className="mb-4">
        <h2 className="font-2xl font-bold"></h2>
        <button onClick={toggleContext} className="flex items-center gap-2 transition-colors">
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
              {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
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
          <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
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

      <div className="mt-4">
        <h2 className="font-2xl font-bold">Match Summary</h2>
        {gameContext ? (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap break-words">{gameContext}</pre>
          </div>
        ) : loading ? (
          <div>Loading match context is like waiting for VAR...</div> // Display loading message while context is being fetched
        ) : (
          <div>No match summary available.</div>
        )}
      </div>

    </div>
  );
};
