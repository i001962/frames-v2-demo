import React, { useEffect, useState } from 'react';
import EventCard from './MatchEventCard'; // Import the EventCard component

// TODO: Update the API URL in env and fetch more than one event eg eng.1 and eng.2 RAG also impacted
const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'; // ESPN Soccer API endpoint

// Define the structure of the detail and event interfaces
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

interface Competitor {
  team: {
    logo: string;
    id: string;
  };
  score: number;
}

interface Competition {
  competitors: Competitor[];
  details: Detail[];
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
  competitions: Competition[];
}

interface ApiResponse {
  events: Event[];
}

const MatchesTab = () => {
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null); // Use ApiResponse type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch matches when the component is mounted
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
        setApiResponse(data); // Store the response with the proper type
        console.log(data);
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

  return (
    <div>
      <h2 className="font-2xl text-notWhite font-bold mb-4">Select match</h2>
      <div className="p-4 mt-2 bg-purplePanel text-lightPurple rounded-lg">
        {loading ? (
          <div>Loading match context is like waiting for VAR...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : apiResponse ? (
          apiResponse.events.map((event) => (
            <EventCard
              key={event.id}
              event={event} // Pass typed event data
            />
          ))
        ) : (
          <div>No data available.</div>
        )}
      </div>
    </div>
  );
};

export default MatchesTab;
