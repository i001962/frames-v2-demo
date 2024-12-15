/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, { FrameContext } from "@farcaster/frame-sdk";
import Image from "next/image";
import RAGameContext from "./RAGameContext";
import { Button } from "~/components/ui/Button";
import { createClient } from "@supabase/supabase-js";
import { Database } from '../../supabase';
import axios from "axios";

// Define the Supabase client
const supabase = createClient<Database>(
  'https://tjftzpjqfqnbtvodsigk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZnR6cGpxZnFuYnR2b2RzaWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1MzA5NDgsImV4cCI6MjA0MDEwNjk0OH0.a6oo59cUi3iQzTpBL0KJ90VXpSel7LDyUlJyPa-FWvs'
);

export default function Demo() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState("matches");  // To manage selected tab
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  //const [selectedTab, setSelectedTab] = useState("matches"); // Set the default to "matches"

  const [gameContext, setGameContext] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [eventsFetched, setEventsFetched] = useState(false); // Track whether events have been fetched
  const [fantasyData, setFantasyData] = useState<any[]>([]);
  const [loadingFantasy, setLoadingFantasy] = useState<boolean>(false);
  const [errorFantasy, setErrorFantasy] = useState<string | null>(null);

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

  useEffect(() => {
    if (selectedTab === "matches" && !eventsFetched) {
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
          setEventsFetched(true); // Mark as fetched
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
    }
  }, [selectedTab]);

  useEffect(() => {
    const fetchFantasyData = async () => {
      setLoadingFantasy(true);
      setErrorFantasy(null);

      try {
        // Query the 'standings' table for 'entry_name', 'rank', 'last_name', and 'fav_team'
        const { data, error } = await supabase
          .from('standings')
          .select('entry_name, rank, last_name, fav_team');

        if (error) {
          throw error;
        }
        // Step 1: Concurrently fetch profile images for each entry with valid fid
        const updatedFantasyData = await Promise.all(
          data.map(async (entry) => {
            const { last_name, fav_team } = entry;

            // Ensure last_name is not null and is a valid number (fid)
            if (last_name && !isNaN(Number(last_name))) {
              const fid = parseInt(last_name, 10); // Ensure fid is an integer

              // Check if fid is a valid integer
              if (Number.isInteger(fid)) {
                const server = "https://hubs.airstack.xyz";

                try {
                  // Make the API call using the fid
                  const response = await axios.get(`${server}/v1/userDataByFid?fid=${fid}`, {
                    headers: {
                      "Content-Type": "application/json",
                      "x-airstack-hubs": "18c933b177db0481294b63138fe69648d"
                    }
                  });

                  // Extract pfp URL from the response
                  let pfpUrl = null;
                  const messages = response.data.messages || [];

                  for (const message of messages) {
                    if (message.data?.userDataBody?.type === 'USER_DATA_TYPE_PFP') {
                      pfpUrl = message.data.userDataBody.value;
                      break;
                    }
                  }

                  // Step 2: Fetch team info from the 'teams' table based on fav_team
                  let teamInfo = null;
                  if (fav_team) {
                    const { data: teamData, error: teamError } = await supabase
                      .from('teams')
                      .select('name, logo')
                      .eq('id', fav_team)
                      .single(); // Assume fav_team maps to one team only

                    if (teamError) {
                      console.error("Error fetching team data", teamError);
                    } else {
                      teamInfo = teamData;
                    }
                  }

                  // If no team info, use a default team logo (defifa_spinner.gif)
                  if (!teamInfo) {
                    teamInfo = { name: 'N/A', logo: '/defifa_spinner.gif' };
                  }

                  // Return updated entry with pfpUrl and teamInfo
                  return {
                    ...entry, // Spread the existing entry data
                    pfp: pfpUrl || '/defifa_spinner.gif', // Use a fallback pfp if not found
                    team: teamInfo // Add team info (either fetched or default)
                  };
                } catch (e) {
                  console.error("Error fetching data from API", e);
                  return { ...entry, pfp: '/defifa_spinner.gif' }; // Fallback on error
                }
              }
            }

            // Return the entry as-is if no valid fid or last_name
            return { ...entry, pfp: '/defifa_spinner.gif', team: { name: 'N/A', logo: '/defifa_spinner.gif' } };
          })
        );

        // Step 3: Set the updated fantasy data with pfp and team info
        setFantasyData(updatedFantasyData);
      } catch (err) {
        if (err instanceof Error) {
          setErrorFantasy(err.message);
        } else {
          setErrorFantasy('An unknown error occurred');
        }
      } finally {
        setLoadingFantasy(false);
      }
    };

    fetchFantasyData();
  }, []); // Fetch data when the component mounts

  const fetchUserData = async (casterFid: number) => {
    try {
      const { data, error } = await supabase
        .from('standings')
        .select('fname, rank, last_name, total, fav_team')
        .eq('last_name', String(casterFid))
        .single();

      if (error) {
        throw error;
      }

      if (data) {
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

          setUserInfo(userInfo);
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

  const installMiniAp = useCallback(() => {
      sdk.actions.addFrame();
  }, []);


  const castSummary = useCallback(() => {
    if (selectedMatch) {
      const { competitors, homeTeam, awayTeam, homeScore, awayScore, clock, homeLogo, awayLogo, eventStarted } = selectedMatch;
      const matchSummary = `${competitors}\n${homeTeam.toUpperCase()} ${eventStarted ? homeScore : ''} - ${eventStarted ? awayScore : ''} ${awayTeam.toUpperCase()}\n${eventStarted ? `${clock}` : `Kickoff: ${clock}`}\n\nUsing the d33m live match mini-app https://d33m-frames-v2.vercel.app cc @kmacb.eth Go ${userInfo?.teamName || 'd33m!'}`;
      const encodedSummary = encodeURIComponent(matchSummary);
      const url = `https://warpcast.com/~/compose?text=${encodedSummary}&channelKey=football&embeds[]=${homeLogo}&embeds[]=${awayLogo}`;

      sdk.actions.openUrl(url);
    }
  }, [selectedMatch, userInfo?.teamName]);

  const readMatchSummary = useCallback(() => {
    if (selectedMatch) {
      const utterance = new SpeechSynthesisUtterance(gameContext);
      if (utterance && typeof utterance.rate === 'number') {
        utterance.rate = 1.5;
      }
      window.speechSynthesis.speak(utterance);
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
                  eventStarted: eventStarted,
                });
                fetchGameContext(homeTeam, awayTeam);
                fetchUserData(context?.user?.fid || 0);
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

  // If ctx is not defined, show the message to go to Purple app
  if (!context) {
    return (
      <div className="w-[375px] mx-auto py-4 px-2">
        <h2 className="text-2xl font-bold text-center text-notWhite">d33m live EPL match summaries mini-app</h2>
        <p className="text-center mt-4 text-fontRed">Open in a Farcaster app</p>
        <a href="https://warpcast.com/kmacb.eth/0xac8d7401" target="_blank" rel="noreferrer" className="block text-center mt-4 text-lightPurple underline">Go to Warpcast</a>
      </div>
    );
  }

  return (
    <div className="w-[400px] mx-auto py-4 px-2">
      {/* <h1 className="text-2xl font-bold text-center text-notWhite mb-4">{title}</h1> */}
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto space-x-4 mb-4">
        <div
          onClick={() => setSelectedTab("matches")}
          className={`flex-shrink-0 py-1 px-6 text-sm font-semibold cursor-pointer rounded-full border-2 ${
            selectedTab === "matches" ? "border-limeGreenOpacity text-lightPurple" : "border-gray-500 text-gray-700"}`}
        >
          Matches
        </div>
        <div
          onClick={() => setSelectedTab("fantasy")}
          className={`flex-shrink-0 py-1 px-6 text-sm font-semibold cursor-pointer rounded-full border-2 ${
            selectedTab === "fantasy" ? "border-limeGreenOpacity text-lightPurple" : "border-gray-500 text-gray-700"}`}
        >
          Fantasy
        </div>
        <div
          onClick={() => setSelectedTab("banter")}
          className={`flex-shrink-0 py-1 px-6 text-sm font-semibold cursor-pointer rounded-full border-2 ${
            selectedTab === "banter" ? "border-limeGreenOpacity text-lightPurple" : "border-gray-500 text-gray-700"}`}
        >
          Banter
        </div>
        <div
          onClick={() => setSelectedTab("players")}
          className={`flex-shrink-0 py-1 px-6 text-sm font-semibold cursor-pointer rounded-full border-2 ${
            selectedTab === "players" ? "border-limeGreenOpacity text-lightPurple" : "border-gray-500 text-gray-700"}`}
        >
          Players
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-darkPurple p-4 rounded-md text-white">
        {selectedTab === "matches" && (
          <div>
            <h2 className="font-2xl text-notWhite font-bold mb-4">Select for AI Summary</h2>
             {/*
             <button
              onClick={() => setIsEventsOpen(!isEventsOpen)}
              className="py-2 px-4 mb-4 text-lg bg-deepPink rounded-md text-white"
            >
              {isEventsOpen ? "Hide Events" : "Show Events"}
            </button> */}
           
              <div className="p-4 mt-2 bg-purplePanel text-lightPurple rounded-lg">
                {loading ? (
                  <div>Loading match context is like waiting for VAR...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : apiResponse ? (
                  apiResponse.events.map((event: any) => renderEvent(event))
                ) : (
                  <div>No data available.</div>
                )}
              </div>
       
            <div className="space-y-4">
              <h3 className="font-semibold text-lg"></h3>
                          {/* Container for AI Summary and Cast Button */}
              <div className="mt-4 text-lightPurple bg-purplePanel">
              {gameContext ? (
                <div className="p-4 bg-purplePanel text-lightPurple rounded-lg">
                  <h2 className="font-2xl text-notWhite font-bold mb-4">
                    <button onClick={readMatchSummary}>{selectedMatch.eventStarted ? `[AI] Match Summary` : `[AI] Match Preview  🗣️🎧1.5x`}</button>
                  </h2>
                  <pre className="text-sm whitespace-pre-wrap break-words">{gameContext}</pre>
                  <div className="mt-4">
                    <Button onClick={castSummary}>Cast</Button>
                  </div>
                  <div className="mt-4">
                    <Button onClick={installMiniAp}>Install mini-app</Button>
                  </div>
                </div>
              ) : loading ? (
                <div></div>
              ) : (
                <div>
                  <Button onClick={installMiniAp}>Install mini-app</Button>
                </div>
              )}
              </div> 
            </div>
          </div>
        )}

        {selectedTab === "fantasy" && (
          <div>
            <h2 className="font-2xl text-notWhite font-bold mb-4">Table</h2>
            {loadingFantasy ? (
              <div className="text-lightPurple">
                <div>Loading fantasy stats...</div>
                <div>
                  The longest VAR check in Premier League history was five minutes and 37 seconds long and took place during a March 2024 match between West Ham and Aston Villa
                </div>
              </div>
            ) : errorFantasy ? (
              <div className="text-red-500">{errorFantasy}</div>
            ) : fantasyData.length > 0 ? (
              <div className="bg-purplePanel p-4 rounded-md">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-notWhite text-left px-4">Manager</th> {/* Add padding to create space */}
                      <th className="text-notWhite text-left px-4">Team</th>   {/* Add padding to create space */}
                      <th className="text-notWhite text-left px-4">Rank</th>   {/* Add padding to create space */}
                    </tr>
                  </thead>
                  <tbody className="text-lightPurple text-sm">
                    {fantasyData.map((entry, index) => (
                      <tr key={index}>
                        <td className="relative flex items-center space-x-3 px-4"> {/* Flexbox layout for images */}
                          <Image
                            src={entry.pfp || '/defifa_spinner.gif'}
                            alt="Home Team Logo"
                            className="rounded-full w-8 h-8 mr-8"
                            width={20}
                            height={20}
                          />
                          {entry.team.logo && entry.team.logo !== '/defifa_spinner.gif' && (
                            <Image
                            src={entry.team.logo} // Team logo URL
                            alt="Team Logo"
                            className="rounded-full w-5 h-5 absolute top-0 left-10" // Absolute positioning for overlap
                            width={15}
                            height={15}
                            loading="lazy" // Lazy loading the image
                          />
                          )}
                        </td>
                        <td>{entry.entry_name}</td>
                        <td className="text-center">{entry.rank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No fantasy data available.</div>
            )}
          </div>
        )}

        {selectedTab === "banter" && (
          <div>
            <h2 className="font-2xl text-notWhite font-bold mb-4">Bot</h2>
            <div className="bg-purplePanel p-4 rounded-md text-lightPurple">
              <p className="text-sm">Soon<sup className="text-sm">™</sup></p>
            </div>
          </div>
        )}

        {selectedTab === "players" && (
          <div>
            <h2 className="font-2xl text-notWhite font-bold mb-4">Collect</h2>
            <div className="bg-purplePanel p-4 rounded-md text-lightPurple">
              <p className="text-sm">Soon<sup className="text-sm">™</sup></p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
