import { useEffect, useState } from 'react';
import sportsData from './sportsData';  // Import the sportsData array

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

function useEventsData(selectedSport: string) {
  const [events, setEvents] = useState<Event[]>([]); // Use the Event type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventsData() {
      setLoading(true);
      setError(null);

      try {
        const sport = sportsData.find(s => s.sportId === selectedSport);
        if (!sport) {
          throw new Error("Invalid sport selected");
        }

        const response = await fetch(sport.url); // Fetch data using the URL from sportsData
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${sport.name}`);
        }

        const data = await response.json();
        setEvents(data.events || []); // Set events data

      } catch (error) {
        setError('Failed to load events data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (selectedSport) {
      fetchEventsData();
    }
  }, [selectedSport]);  // Dependency array includes selectedSport

  return { events, loading, error };
}

export default useEventsData;
