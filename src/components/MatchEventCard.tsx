import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '~/components/ui/Button'; // Assuming Button component is imported
import RAGameContext from './ai/RAGameContext';  // Import the function to fetch game context
import sdk from "@farcaster/frame-sdk";

// Define the structure of detail
interface Detail {
  athletesInvolved: Array<{ displayName: string }>;
  type: {
    text: string;
  };
  clock: {
    displayValue: string;
  };
  team: {
    id: string;
  };
}

interface EventCardProps {
  sportId: string;
  event: {
    id: string;
    shortName: string;
    name: string;
    date: string;
    status: {
      displayClock: string;
      type: {
        detail: string;
      };
    };
    competitions: {
      competitors: {
        team: {
          logo: string;
          id: string;
        };
        score: number;
      }[];
      details: Detail[];
    }[];
  };
}

// Define the selected match type
interface SelectedMatch {
  homeTeam: string;
  awayTeam: string;
  competitorsLong: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number;
  awayScore: number;
  clock: string;
  eventStarted: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, sportId }) => {
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);
  const [gameContext, setGameContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // State to toggle details visibility

  const competitorsLong = event.name; // Remove '@' and spaces
  const homeTeam = event.shortName.slice(6, 9);
  const awayTeam = event.shortName.slice(0, 3);
  console.log('Competitors:', homeTeam, awayTeam);
  console.log('Competitors:', event.shortName);
  const eventStarted = new Date() >= new Date(event.date);
  const clock = event.status.displayClock + ' ' + event.status.type.detail || '00:00';

  const homeTeamLogo = event.competitions[0]?.competitors[0]?.team.logo;
  const awayTeamLogo = event.competitions[0]?.competitors[1]?.team.logo;
  const homeScore = event.competitions[0]?.competitors[0]?.score;
  const awayScore = event.competitions[0]?.competitors[1]?.score;

  // keyMoments is a mapped array of event details
  const keyMoments = event.competitions[0]?.details
    .reduce((acc: { action: string; logo: string; playerName: string; times: string[] }[], detail: Detail) => {
      const playerName = detail.athletesInvolved && detail.athletesInvolved.length > 0
        ? detail.athletesInvolved[0]?.displayName || 'Coaching staff'
        : 'Coaching staff';

      const action = detail.type.text;
      const time = detail.clock.displayValue || '00:00';
      const teamId = detail.team.id;

      let teamLogo = '';
      if (teamId === event.competitions[0]?.competitors[0]?.team.id) {
        teamLogo = homeTeamLogo;
      } else {
        teamLogo = awayTeamLogo;
      }

      if (action === "Goal" || action === "Goal - Header" || action === "Penalty - Scored" || action === "Goal - Volley" || action === "Goal - Free-kick" || action === "Own Goal") {
        const existingGoal = acc.find(item => item.playerName === playerName);
        if (existingGoal) {
          existingGoal.times.push(time);
        } else {
          acc.push({
            playerName,
            times: [time],
            logo: teamLogo,
            action: action === "Own Goal" ? "🔴" : "⚽️",
          });
        }
      } else {
        acc.push({
          playerName,
          times: [time],
          action: action === "Yellow Card" ? "🟨" : action === "Red Card" ? "🟥" : action,
          logo: teamLogo,
        });
      }

      return acc;
    }, [])
    .map((moment, index) => {
      const formattedAction = moment.action || "⚽️";
      const playerNameClass = formattedAction === "🔴" ? "text-fontRed" : "text-lightPurple";

      return (
        <div key={index} className="text-sm text-lightPurple flex items-center">
          <span className="mr-2 font-bold">{formattedAction}</span>
          <Image
            src={moment.logo || '/assets/defifa_spinner.gif'}
            alt="Team Logo"
            className="w-6 h-6 mr-2"
            width={15}
            height={15}
          />
          <span className={playerNameClass}>{moment.playerName}</span>
          <span className="text-xs ml-1">{moment.times.join(', ')}</span>
        </div>
      );
    });

  const handleSelectMatch = async () => {
    setSelectedMatch({
      homeTeam,
      awayTeam,
      competitorsLong,
      homeLogo: homeTeamLogo,
      awayLogo: awayTeamLogo,
      homeScore,
      awayScore,
      clock,
      eventStarted,
    });
    console.log('Selected match:', selectedMatch);
    // Fetch game context when match is selected
    setLoading(true);
    
    try {
      console.log('Fetching game context...', sportId, event.id );
      const data = await RAGameContext(event.id, sportId, competitorsLong);
      if (data && typeof data === 'string') {
        setGameContext(data); // Set only the 'text' from AiSummary
      } else {
        setGameContext('Failed to fetch AI context.');
      }
    } catch (error) {
      setGameContext('Failed to fetch game context. Ping @kmacb.eth.'); // TODO: Handle error
      console.log('Error fetching game context let kmacb.eth:', error);
    } finally {
      setLoading(false);
    }
  };

  const readMatchSummary = () => {
    if (gameContext) {
      const utterance = new SpeechSynthesisUtterance(gameContext);
      if (utterance && typeof utterance.rate === 'number') {
        utterance.rate = 1.5;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // UseCallback hook for openWarpcastUrl to handle URL opening
  const openWarpcastUrl = useCallback(() => {
    if (selectedMatch) {
      const { competitorsLong, homeTeam, awayTeam, homeScore, awayScore, clock, homeLogo, awayLogo, eventStarted } = selectedMatch;
      const matchSummary = `${competitorsLong}\n${homeTeam} ${eventStarted ? homeScore : ''} - ${eventStarted ? awayScore : ''} ${awayTeam.toUpperCase()}\n${eventStarted ? `${clock}` : `Kickoff: ${clock}`}\n\nUsing the FC Footy mini-app https://d33m-frames-v2.vercel.app cc @kmacb.eth`;
      const encodedSummary = encodeURIComponent(matchSummary);
      const url = `https://warpcast.com/~/compose?text=${encodedSummary}&channelKey=football&embeds[]=${homeLogo}&embeds[]=${awayLogo}`;
      sdk.actions.openUrl(url);  // This is where you replace window.open with sdk.actions.openUrl
    }
  }, [selectedMatch]);

  const castSummary = () => {
    openWarpcastUrl();
  };

  // Toggle visibility of details when clicking the row
  const toggleDetails = () => {
    setShowDetails(!showDetails); // Toggle visibility of match details
  };

  return (
    <div key={event.id} className="sidebar">
      <div className="hover:bg-deepPink cursor-pointer border border-darkPurple">
        <button onClick={() => { handleSelectMatch(); toggleDetails(); }} className="dropdown-button cursor-pointer flex items-center mb-2 w-full">
          {/* Toggle Details */}
          <div className="cursor-pointer text-lightPurple mr-4">
            {showDetails ? "▼" : "▷"}
          </div>      
          {/* Match Information */}
          <span className="flex justify-center space-x-4 ml-2 mr-2">
            <div className="flex flex-col items-center space-y-1">
              <Image src={homeTeamLogo || '/assets/defifa_spinner.gif'} alt="Home Team Logo" className="w-8 h-8" width={20} height={20} />
              <span>{homeTeam}</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              {eventStarted ? (
                <>
                  <span className="text-white font-bold text-2xl">{homeScore} - {awayScore}</span>
                  <span className="text-lightPurple text-xs">{clock}</span>
                </>
              ) : (
                <>
                  <span className="flex flex-col items-center">
                    <span>Kickoff:</span>
                    <span className="text-sm text-lightPurple">{new Date(event.date).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Image src={awayTeamLogo || '/assets/defifa_spinner.gif'} alt="Away Team Logo" className="w-8 h-8" width={20} height={20} />
              <span>{awayTeam}</span>
            </div>
          </span>
        </button>
      </div>
      
      {/* Conditional rendering for key moments and game context */}
      {showDetails && eventStarted && (
        <div className="mt-2 mt-2">
          <h4 className="text-notWhite font-semibold mb-2">Key Moments:</h4>
          {keyMoments.length > 0 ? (
            <div className="space-y-1">{keyMoments}</div>
          ) : (
            <span className="text-lightPurple">No key moments yet.</span>
          )}
        </div>
      )}

      {showDetails && gameContext && (
        <div className="mt-4 text-lightPurple bg-purplePanel">
          <h2 className="font-2xl text-notWhite font-bold mb-4">
            <button onClick={readMatchSummary}>
              {eventStarted
                ? `[AI] Match Summary 🗣️🎧1.5x`
                : `[AI] Match Preview 🗣️🎧1.5x`}
            </button>
          </h2>
          <pre className="text-sm whitespace-pre-wrap break-words">{gameContext}</pre>
          <div className="mt-2 mb-4">
            <Button onClick={castSummary}>Cast</Button>
          </div>
        </div>
      )}
      {loading && <div className='text-fontRed'>Reloading match context...</div>}
    </div>
  );
};

export default EventCard;
