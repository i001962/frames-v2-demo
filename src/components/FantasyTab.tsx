// components/FantasyTab.tsx
import React, { useState, useEffect } from 'react';
import FantasyRow from './FantasyRow';
import { fetchFantasyData } from './utils/fetchFantasyData';

interface FantasyEntry {
  manager: string;
  rank: number;  // Allow null for rank
  total: number;  // Allow null for total
  fav_team: string;
  pfp: string;  // Allow null for pfp
  team: {
    name: string;
    logo: string;
  };
}


const FantasyTab = () => {
  const [fantasyData, setFantasyData] = useState<FantasyEntry[]>([]); 
  const [loadingFantasy, setLoadingFantasy] = useState<boolean>(false);
  const [errorFantasy, setErrorFantasy] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingFantasy(true);
      setErrorFantasy(null);
  
      try {
        const data = await fetchFantasyData();
        handleFetchedData(data); // Process and set the data
      } catch (error) {
        if (error instanceof Error) {
          setErrorFantasy(error.message);
        } else {
          setErrorFantasy('An unknown error occurred');
        }
      } finally {
        setLoadingFantasy(false);
      }
    };
  
    fetchData();
  }, []);
  
  const handleFetchedData = (data: any[]) => {
    const formattedData = data.map((item) => ({
      pfp: item.pfp,
      team: {
        name: item.team.name ?? '', // Replace null with empty string
        logo: item.team.logo ?? '',
      },
      manager: item.manager,
      entry_name: item.entry_name ?? '',
      rank: item.rank ?? 0,  // Replace null with 0
      last_name: item.last_name ?? '',
      fav_team: item.fav_team ?? 0, // Replace null with 0
      total: item.total ?? 0,  // Replace null with 0
    }));
  
    setFantasyData(formattedData); // Now the data will match the FantasyEntry type
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
