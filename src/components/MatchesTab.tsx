import React, { useState } from 'react';
import EventCard from './MatchEventCard'; // Import the EventCard component
import useEventsData from './utils/useEventsData'; // Import the custom hook
import sportsData from './utils/sportsData'; // Import the sports data

// Define the structure for event details
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

// Define the structure for events
export interface Event {
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

const MatchesTab = () => {
  const [selectedSport, setSelectedSport] = useState<string>(sportsData[0].sportId); // Default sport
  const { events, loading, error } = useEventsData(selectedSport); // Fetch events based on selected sport

  // Function to handle sport selection
  const handleTabClick = (sportId: string) => {
    console.log('Selected sport:', sportId);
    setSelectedSport(sportId); // Update selected sport
  };

  return (
    <div>
      <h2 className="font-2xl text-notWhite font-bold mb-4">Select league</h2>

      {/* Horizontal Scrollable Menu for Sports */}
      <div className="flex overflow-x-auto space-x-4 mb-4">
        {sportsData.map((sport) => (
          <button
            key={sport.sportId}
            onClick={() => handleTabClick(sport.sportId)}
            className={`flex-shrink-0 py-1 px-6 text-sm font-semibold cursor-pointer rounded-full border-2 ${
              selectedSport === sport.sportId
                ? "border-limeGreenOpacity text-lightPurple" : "border-gray-500 text-gray-500"
            }`}
          >
            {sport.name} {/* Display the human-readable name */}
          </button>
        ))}
      </div>

      {/* Matches Content */}
      <div className="p-4 mt-2 bg-purplePanel text-lightPurple rounded-lg">
        {loading ? (
          <div>Loading match context...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : events.length > 0 ? (
          events.map((event: Event) => ( 
            <EventCard 
              key={event.id} 
              event={event} 
              sportId={selectedSport}
            />
          ))
        ) : (
          <div>No events available for {selectedSport}</div>
        )}
      </div>
    </div>
  );
};

export default MatchesTab;
