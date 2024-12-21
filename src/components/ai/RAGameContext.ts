/* eslint-disable @typescript-eslint/no-explicit-any */
import sendOpenAi from './sendOpenAi';

const RAGameContext = async (sixCharacterString: string): Promise<any> => {
  const openAiApiKey = process.env.NEXT_PUBLIC_OPENAIKEY;
  ; // Make sure to use environment variables in production
  const prefix = "Clear the context history and start over with the following info:";
  // const maxTokens = 16385;
  // let messageHistory: any[] = [];

  /* function countTokens(text: string) {
    return text.split(/\s+/).length;
  } */

/*   const manageContext = (messages: any[], newMessage: any, maxTokens: number) => {
    messages.push(newMessage);
    let totalTokens = messages.reduce((sum, msg) => sum + countTokens(msg), 0);

    while (totalTokens > maxTokens) {
      totalTokens -= countTokens(messages.shift());
    }
    return messages;
  }; */

  async function fill(sixCharacterString: string, tournament: string): Promise<any> {
    const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${tournament}/scoreboard`;
    const summaryUrl = (eventId: string) => `https://site.api.espn.com/apis/site/v2/sports/soccer/${tournament}/summary?event=${eventId}`;
    let summarizedEvents = [];

    try {
      const scoreboardResponse = await fetch(scoreboardUrl);
      const scoreboardData = await scoreboardResponse.json();
      const events = scoreboardData.events;

      const matchingEvent = events.find((event: { id: string, shortName: string }) => {
        const formattedShortName = event.shortName.split('@').reverse().join('').replace(/\s/g, '').toLowerCase();
        return formattedShortName === sixCharacterString.toLowerCase();
      });

      if (matchingEvent) {
        const summaryResponse = await fetch(summaryUrl(matchingEvent.id));
        const summaryData = await summaryResponse.json();
        console.log('Summary data:', summaryData);

        if (!openAiApiKey) {
          const errorMessage = 'OpenAI API key is missing';
          console.error(errorMessage);
          return null;  // Ensure proper rejection if there's no API key
        }

        if (!summaryData.keyEvents) {
          console.log('No key events found for:', sixCharacterString, 'loading standings instead');
          summarizedEvents = [{
            text: `Provide a match preview for the upcoming match between ${sixCharacterString.slice(0, 3)} and ${sixCharacterString.slice(3, 6)}. Use future tense to describe what is expected to happen, such as key players to watch, possible match dynamics, and any relevant statistics or history. Do not speculate on a winner or mention any results, and avoid using past tense (e.g., "won", "lost"). Focus solely on the upcoming match and do not include any external links.`
          }];
        } else {
          summarizedEvents = summaryData.keyEvents.map((event: {
            text: any;
            shortText: any;
            team: { displayName: any };
            participants: any[];
            clock: { displayValue: any };
            period: { number: any };
            venue: { fullName: any, address: any };
          }) => ({
            text: event.text,
            team: event.team ? event.team.displayName : null,
            time: event.clock.displayValue,
          }));
        }

        const gameInfo = summaryData.gameInfo;
        const standings = summaryData.standings;
        const prefixPrompt = {
          prompt: `Provide a match preview for the upcoming match between ${sixCharacterString.slice(0, 3)} and ${sixCharacterString.slice(3, 6)}. Describe the expected match dynamics using future tense only, such as key players, anticipated strategies, and possible match outcomes. Do **not** use past tense like 'won', 'lost', or 'defeated' if the match clock has not yet started, so focus on the **future** and avoid making definitive claims about the result. Do not include any external links or markdown.`
        };
        const jsonData = JSON.stringify({ prefixPrompt, summarizedEvents, gameInfo, standings });
        // messageHistory = manageContext(messageHistory, jsonData, maxTokens);
        const aiSummary = await sendOpenAi(jsonData, openAiApiKey || "");

        return aiSummary;  // Ensure the matchingEvent is returned
      }

      return null;  // If no matching event is found, return null
    } catch (error) {
      console.log('Error setting AI context:', error);
      return null;  // Return null on error
    }
  }

  const tournaments = ["eng.1", "eng.2"];
  let matchingEvent = null;

  for (const tournament of tournaments) {
    matchingEvent = await fill(sixCharacterString, tournament);
    if (matchingEvent) {
      break;
    }
  }

  if (!matchingEvent) {
    console.log('No matching event found for:', sixCharacterString);
    await sendOpenAi(prefix, openAiApiKey || "");
    await sendOpenAi('No events found', openAiApiKey || "");
    return null;  // Return null if no matching event is found
  }

  return matchingEvent;  // Ensure matchingEvent is returned if found
};

export default RAGameContext;
