/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, { FrameContext } from "@farcaster/frame-sdk";
import Image from "next/image";
import RAGameContext from "./RAGameContext";
import { Button } from "~/components/ui/Button";
import { createClient } from "@supabase/supabase-js";
import { Database } from '../../supabase';

// Define the Supabase client
const supabase = createClient<Database>(
  'https://tjftzpjqfqnbtvodsigk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZnR6cGpxZnFuYnR2b2RzaWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1MzA5NDgsImV4cCI6MjA0MDEwNjk0OH0.a6oo59cUi3iQzTpBL0KJ90VXpSel7LDyUlJyPa-FWvs'
);

export default function Demo({ title = "d33m" }: { title?: string }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext | undefined>(undefined);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [gameContext, setGameContext] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null); // New state to store user data

  const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'; // ESPN Soccer API endpoint

  useEffect(() => {
    const load = async () => {
      const ctx = await sdk.context;
      setContext(ctx); // Store the context
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setApiResponse(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUserData = async (casterFid: number) => {
    try {
      // Fetch user data using casterFid
      const { data, error } = await supabase
        .from('standings')
        .select('fname, rank, last_name, total, fav_team')
        .eq('last_name', String(casterFid)) // Match last_name (casterFid)
        .single();
  
      if (error) {
        throw error;
      }
  
      if (data) {
        // Check if fav_team is not null before querying the teams table
        if (data.fav_team !== null) {
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('id, name')
            .eq('id', data.fav_team)
            .single();
  
          if (teamsError) {
            throw teamsError;
          }
  
          const userInfo = {
            username: data.fname,
            total: data.total,
            teamName: teamsData?.name || "No team set"
          };
  
          setUserInfo(userInfo); // Store the user information
        } else {
          console.log("No favorite team set for this user.");
          setUserInfo({ username: data.fname, total: data.total, teamName: "No team set" });
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };
  

  const fetchGameContext = (homeTeam: string, awayTeam: string) => {
    setGameContext(null);
    setLoading(true);

    const eventId = `${homeTeam}${awayTeam}`;
    RAGameContext(eventId)
      .then((data) => {
        setGameContext(data);
        setLoading(false);
      })
      .catch((err) => {
        setGameContext("Failed to fetch game context " + eventId);
        setLoading(false);
        console.error("Failed to fetch game context", err);
      });
  };

  const toggleContext = useCallback(() => {
    setIsContextOpen((prev) => !prev);
  }, []);

  // Button to trigger external URL when clicked
  const castSummary = useCallback(() => {
    if (selectedMatch) {
      const { competitors, homeTeam, awayTeam, homeScore, awayScore, clock, homeLogo, awayLogo } = selectedMatch;
      const matchSummary = `${competitors}\n${homeTeam.toUpperCase()} ${homeScore} ${awayTeam.toUpperCase()} ${awayScore}\n${clock}\n\nUsing the d33m live match mini-app d33m-frames-v2.vercel.app cc @kmacb.eth Go ${userInfo?.teamName || 'd33m!'}`;
      const encodedSummary = encodeURIComponent(matchSummary);
      const url = `https://warpcast.com/~/compose?text=${encodedSummary}&channelKey=football&embeds[]=${homeLogo}&embeds[]=${awayLogo}`;

      console.log("Opening URL:", url);
      sdk.actions.openUrl(url);
    } else {
      console.log("No match selected");
    }
  }, [selectedMatch, userInfo?.teamName]);

  const readMatchSummary = useCallback(() => {
    if (selectedMatch) {
      // const { homeTeam, homeScore, awayTeam, awayScore, clock } = selectedMatch;
      // const matchSummary = `${homeTeam.toUpperCase()} ${homeScore} - ${awayScore} ${awayTeam.toUpperCase()}, Current time: ${clock}`;
      console.log("Reading match summary aloud:", gameContext);
      const utterance = new SpeechSynthesisUtterance(gameContext);
      if (utterance && typeof utterance.rate === 'number') {
        // Set the rate to 1.5x
        utterance.rate = 1.5;
      } else {
        console.error("Rate property is not available on the utterance.");
      }
        window.speechSynthesis.speak(utterance); // Speak the match summary aloud
    } else {
      console.log("No match selected");
    }
  }, [gameContext, selectedMatch]);

  const renderEvent = (event: any) => {
    const homeTeam = event.shortName.split('@')[1].trim().toLowerCase();
    const awayTeam = event.shortName.split('@')[0].trim().toLowerCase();
    const competitors = event.name;
    const eventTime = new Date(event.date);
    const scores = event.competitions[0]?.competitors.map((c: any) => c.score).join('  -  ');
    const eventStarted = new Date() >= new Date(event.date);
    const dateTimeString = eventTime.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' }) +
      ' ' + eventTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const clock = event.status.displayClock + ' ' + event.status.type.detail || '00:00';

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
                });
                fetchGameContext(homeTeam, awayTeam);
                fetchUserData(context?.user?.fid || 0); // Call the user data fetch
                toggleContext();
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

  // If ctx is not defined, show the message to go to Purple app
  if (!context) {
    return (
      <div className="w-[300px] mx-auto py-4 px-2">
        <h2 className="text-2xl font-bold text-center text-notWhite">d33m live EPL match summaries mini-app</h2>
        <p className="text-center mt-4 text-fontRed">Open in a Farcaster app</p>
        <a href="https://warpcast.com/kmacb.eth/0xac8d7401" target="_blank" rel="noreferrer" className="block text-center mt-4 text-lightPurple underline">Go to Warpcast</a>
      </div>
    );
  }

  // If ctx is defined, render the app content
  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center text-notWhite mb-4">{title}</h1>
      <div className="mb-4">
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
              {selectedMatch.homeTeam} {selectedMatch.homeScore} - {selectedMatch.awayScore} {selectedMatch.awayTeam}
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
              apiResponse.events.map((event: any) => renderEvent(event))
            ) : (
              <div>No data available.</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-lightPurple bg-purplePanel">
        {gameContext ? (
          <div className="p-4 bg-purplePanel text-lightPurple rounded-lg">
            <h2 className="font-2xl text-notWhite font-bold">Match Summary for {userInfo.username}
              <button onClick={readMatchSummary}> 🗣️🎧1.5x</button>
            </h2>
            <pre className="text-sm whitespace-pre-wrap break-words">{gameContext}</pre>
            <div className="mt-4">
              <Button onClick={castSummary}>Cast</Button>
            </div>
          </div>
        ) : loading ? (
          <div>Loading match context is like waiting for VAR...</div>
        ) : (
          <div>The match has not started yet.</div>
        )}
      </div>
    </div>
  );
}
