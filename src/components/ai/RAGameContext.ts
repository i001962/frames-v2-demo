import sendOpenAi from './sendOpenAi';

interface KeyEvent {
  text: string;
  shortText: string;
  team: { displayName: string };
  participants: string[]; // Add a more specific type if possible
  clock: { displayValue: string };
  period: { number: number };
  venue: { fullName: string; address: string };
}

interface SummaryData {
  keyEvents: KeyEvent[];
  gameInfo: string; // Replace with specific type if possible
  standings: string; // Replace with specific type if possible
}

interface Event {
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
}

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

interface AiSummary {
  text: string;
  team?: string | null;
  time?: string | null;
}

const RAGameContext = async (
  eventId: string,
  tournament: string,
  competitors: string
): Promise<AiSummary | null> => {
  const openAiApiKey = process.env.NEXT_PUBLIC_OPENAIKEY;
  const prefix = "Clear the context history and start over with the following info:";

  async function fetchEventData(
    eventId: string,
    tournament: string,
    competitors: string
  ): Promise<AiSummary | null> {
    const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${tournament}/scoreboard`;
    const summaryUrl = (eventId: string) => `https://site.api.espn.com/apis/site/v2/sports/soccer/${tournament}/summary?event=${eventId}`;
    let summarizedEvents: AiSummary[] = [];

    try {
      // Fetch the scoreboard data
      const scoreboardResponse = await fetch(scoreboardUrl);
      const scoreboardData = await scoreboardResponse.json();
      const events: Event[] = scoreboardData.events;

      // Find the matching event using eventId
      const matchingEvent = events.find((event: Event) => event.id === eventId);

      if (matchingEvent) {
        // Fetch event summary if event is found
        const summaryResponse = await fetch(summaryUrl(matchingEvent.id));
        const summaryData: SummaryData = await summaryResponse.json();

        if (!openAiApiKey) {
          console.error('OpenAI API key is missing');
          return null;
        }

        // If no key events are found, load a default prompt
        if (!summaryData.keyEvents || summaryData.keyEvents.length === 0) {
          summarizedEvents = [{
            text: `Provide a match preview for the upcoming match between ${competitors.slice(0, 3)} and ${competitors.slice(3, 6)}. Use future tense to describe what is expected to happen, such as key players to watch, possible match dynamics, and any relevant statistics or history. Do not speculate on a winner or mention any results, and avoid using past tense (e.g., "won", "lost"). Focus solely on the upcoming match and do not include any external links.`
          }];
        } else {
          summarizedEvents = summaryData.keyEvents.map((event: KeyEvent) => ({
            text: event.text,
            team: event.team ? event.team.displayName : null,
            time: event.clock.displayValue,
          }));
        }

        const gameInfo = summaryData.gameInfo;
        const standings = summaryData.standings;
        const prefixPrompt = {
          prompt: `Provide a match preview for the upcoming match between ${competitors.slice(0, 3)} and ${competitors.slice(3, 6)}. Describe the expected match dynamics using future tense only, such as key players, anticipated strategies, and possible match outcomes. Do **not** use past tense like 'won', 'lost', or 'defeated' if the match clock has not yet started, so focus on the **future** and avoid making definitive claims about the result. Do not include any external links or markdown.`
        };

        const jsonData = JSON.stringify({ prefixPrompt, summarizedEvents, gameInfo, standings });
        const aiSummary = await sendOpenAi(jsonData, openAiApiKey || "");

        return aiSummary;  // Return AI-generated summary
      }

      return null;  // If no matching event is found, return null
    } catch (error) {
      console.log('Error setting AI context:', error);
      return null;  // Return null on error
    }
  }

  // Call the function for the provided eventId and tournament
  const result = await fetchEventData(eventId, tournament, competitors);

  if (!result) {
    console.log('No matching event found for:', eventId);
    await sendOpenAi(prefix, openAiApiKey || "");
    await sendOpenAi('No events found', openAiApiKey || "");
    return null;  // Return null if no matching event is found
  }

  return result;  // Return the result if found
};

export default RAGameContext;