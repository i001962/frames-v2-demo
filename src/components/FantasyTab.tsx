import React, { useState, useEffect } from 'react';
import FantasyRow from './FantasyRow'; // Import the FantasyRow component
import { fetchFantasyData } from './utils/fetchFantasyData'; // Adjust the import path accordingly

// Define the FantasyEntry type
interface FantasyEntry {
  pfp: string | null;
  team: {
    name: string | null;
    logo: string | null;
  };
  manager: string;
  entry_name: string | null;
  rank: number | null;
  last_name: string | null;
  fav_team: number | null;
  total: number | null;
}

const FantasyTab = () => {
  const [fantasyData, setFantasyData] = useState<FantasyEntry[]>([]); // Store fantasy data
  const [loadingFantasy, setLoadingFantasy] = useState<boolean>(false); // Loading state
  const [errorFantasy, setErrorFantasy] = useState<string | null>(null); // Error state

  // Fetch fantasy data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoadingFantasy(true);
      setErrorFantasy(null);

      try {
        const data = await fetchFantasyData(); // Call the function to fetch data
        handleFetchedData(data); // Process and set the data
      } catch (error) {
        if (error instanceof Error) {
          setErrorFantasy(error.message); // Set the error message
        } else {
          setErrorFantasy('An unknown error occurred'); // Fallback error message
        }
      } finally {
        setLoadingFantasy(false); // Reset loading state
      }
    };

    fetchData();
  }, []); // Empty dependency array means this will run once when the component mounts

  // Handle the fetched data and update state
  const handleFetchedData = (data: FantasyEntry[]) => {
    const updatedData = data.map(item => ({
      ...item,
      rank: item.rank ?? 0, // Replace null rank with a default value (e.g., 0)
    }));
    setFantasyData(updatedData); // Set the updated data
  };

  return (
    <div>
      <h2 className="font-2xl text-notWhite font-bold mb-4">Table</h2>

      {loadingFantasy ? (
        <div className="text-lightPurple">
          <div>Loading fantasy stats...</div>
          <div>
            The longest VAR check in Premier League history was five minutes and 37 seconds long and took place during a March 2024 match between West Ham and Aston Villa.
          </div>
        </div>
      ) : errorFantasy ? (
        <div className="text-red-500">{errorFantasy}</div>
      ) : fantasyData.length > 0 ? (
        <div className="bg-purplePanel p-4 rounded-md">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-notWhite text-left px-4">FC</th>
                <th className="text-notWhite text-left">Manager</th>
                <th className="text-notWhite text-left px-4">Rank</th>
                <th className="text-notWhite text-left px-4">Pts</th>
              </tr>
            </thead>
            <tbody className="text-lightPurple text-sm mt-2 border-spacing-2">
              {fantasyData.map((entry, index) => (
                <FantasyRow
                  key={index}
                  entry={entry}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No fantasy data available.</div>
      )}
    </div>
  );
};

export default FantasyTab;
