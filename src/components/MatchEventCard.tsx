import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '~/components/ui/Button'; // Assuming Button component is imported
import RAGameContext from './ai/RAGameContext';  // Import the function to fetch game context
import { WarpcastShareButton } from './ui/WarpcastShareButton'; // Import the WarpcastShareButton component

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
  const [showDetails, setShowDetails] = useState(false);
  const [isAiSummaryGenerated, setIsAiSummaryGenerated] = useState(false); // Track if AI summary is generated
  const elementRef = useRef<HTMLDivElement | null>(null);

  const competitorsLong = event.name;
  const homeTeam = event.shortName.slice(6, 9);
  const awayTeam = event.shortName.slice(0, 3);
  const eventStarted = new Date() >= new Date(event.date);
  const clock = event.status.displayClock + ' ' + event.status.type.detail || '00:00';

  const homeTeamLogo = event.competitions[0]?.competitors[0]?.team.logo;
  const awayTeamLogo = event.competitions[0]?.competitors[1]?.team.logo;
  const homeScore = event.competitions[0]?.competitors[0]?.score;
  const awayScore = event.competitions[0]?.competitors[1]?.score;

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

  const handleSelectMatch = () => {
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
  };

  const fetchAiSummary = async () => {
    if (selectedMatch) {
      try {
        setLoading(true);
        const data = await RAGameContext(event.id, sportId, competitorsLong);
        if (data && typeof data === 'string') {
          setGameContext(data);
          setIsAiSummaryGenerated(true); // Set flag to true after AI summary is generated
        } else {
          setGameContext('Failed to fetch AI context.');
        }
      } catch (error) {
        setGameContext('Failed to fetch game context.');
        console.error('Failed to fetch game context:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const readMatchSummary = () => {
    if (gameContext) {
      const utterance = new SpeechSynthesisUtterance(gameContext);
      utterance.rate = 1.5;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails); // Toggle visibility of match details
    setIsAiSummaryGenerated(false); // Reset the AI summary visibility flag when toggling
  };

  return (
    <div key={event.id} className="sidebar">
      <div className="hover:bg-deepPink cursor-pointer border border-darkPurple">
        <button onClick={() => { handleSelectMatch(); toggleDetails(); }} className="dropdown-button cursor-pointer flex items-center mb-2 w-full">
          <div className="cursor-pointer text-lightPurple mr-4">
            {showDetails ? "▼" : "▷"}
          </div>
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

      {showDetails && selectedMatch && (
        <>
          <div ref={elementRef} className="mt-2 mt-2 bg-purplePanel p-4 rounded-lg">
            {/* hidden but used to create screenshot during ShareCast */}
            <div className="flex justify-center space-x-4 ml-2 mr-2"
              style={{ visibility: 'hidden', display: 'none' }} // Initially hidden
            >
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
            </div>

            {/* Key Moments */}
            <h4 className="text-notWhite font-semibold mb-2">Key Moments:</h4>
            {keyMoments.length > 0 ? (
              <div className="space-y-1">{keyMoments}</div>
            ) : (
              <span className="text-lightPurple">No key moments yet.</span>
            )}

            {/* AI Summary Button */}
            {!isAiSummaryGenerated && (
              <Button className="mt-2 w-full max-w-xs mx-auto block bg-deepPink text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-deepPink hover:bg-fontRed" onClick={fetchAiSummary}>Match Summary</Button>
            )}

            {gameContext && (
              <div className="mt-4 text-lightPurple bg-purplePanel">
                <h2 className="font-2xl text-notWhite font-bold mb-4">
                  <button onClick={readMatchSummary}>
                    {eventStarted
                      ? `[AI] Match Summary 🗣️🎧1.5x`
                      : `[AI] Match Preview 🗣️🎧1.5x`}
                  </button>
                </h2>
                <pre className="text-sm whitespace-pre-wrap break-words mb-4">{gameContext}</pre>
                <WarpcastShareButton selectedMatch={selectedMatch} targetElement={elementRef.current} />
              </div>
            )}
          </div>          
        </>
      )}
      {loading && <div className="text-lightPurple">Loading...</div>}
    </div>
  );
};


export default EventCard;
