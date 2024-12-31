import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { Database } from '../../../supabase';

const openAiApiKey = process.env.NEXT_PUBLIC_API_AIRSTACK || '';
const supabaseApiKey = process.env.NEXT_PUBLIC_API_SUP || '';

const supabase = createClient<Database>(
  'https://tjftzpjqfqnbtvodsigk.supabase.co',
  supabaseApiKey
);

// Define FantasyEntry type to match the expected data structure
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

export const fetchFantasyData = async (): Promise<FantasyEntry[]> => {
  try {
    // Query Supabase 'standings' table
    const { data, error } = await supabase
      .from('standings')
      .select('entry_name, rank, last_name, fav_team, total');

    if (error) {
      throw error;
    }

    // Step 1: Fetch additional data (profile, team info) concurrently
    const updatedFantasyData = await Promise.all(
      data.map(async (entry: { entry_name: string | null; rank: number | null; last_name: string | null; fav_team: number | null; total: number | null; }) => {
        const { last_name, fav_team } = entry;

        // Handle last_name being a valid number (fid)
        if (last_name && !isNaN(Number(last_name))) {
          const fid = parseInt(last_name, 10);
          if (Number.isInteger(fid)) {
            const server = "https://hubs.airstack.xyz";
            try {
              // Fetch user data by fid
              const response = await axios.get(`${server}/v1/userDataByFid?fid=${fid}`, {
                headers: {
                  "Content-Type": "application/json",
                  "x-airstack-hubs": openAiApiKey
                }
              });

              // Extract profile image and username from the response
              let pfpUrl = null;
              let username = null;
              const messages = response.data.messages || [];
              for (const message of messages) {
                if (message.data?.userDataBody?.type === 'USER_DATA_TYPE_PFP') {
                  pfpUrl = message.data.userDataBody.value;
                }
                if (message.data?.userDataBody?.type === 'USER_DATA_TYPE_USERNAME') {
                  username = message.data.userDataBody.value;
                }
              }

              // Step 2: Fetch team info based on fav_team
              let teamInfo = null;
              if (fav_team) {
                const { data: teamData, error: teamError } = await supabase
                  .from('teams')
                  .select('name, logo')
                  .eq('id', fav_team)
                  .single();

                if (teamError) {
                  console.error("Error fetching team data", teamError);
                } else {
                  teamInfo = teamData;
                }
              }

              // Fallback to default values if no team data is found
              if (!teamInfo) {
                teamInfo = { name: 'N/A', logo: '/defifa_spinner.gif' };
              }

              // Return updated entry with profile, team info
              return {
                ...entry,
                pfp: pfpUrl || '/defifa_spinner.gif', // Ensure pfp has a fallback
                team: teamInfo, // Ensure team info is always provided
                manager: username || 'anon', // Ensure manager has a fallback
              };
            } catch (e) {
              console.error("Error fetching user data", e);
              return { ...entry, pfp: '/defifa_spinner.gif', team: { name: 'N/A', logo: '/defifa_spinner.gif' }, manager: 'FID not set 🤦🏽‍♂️' }; // Fallback if error occurs
            }
          }
        }

        // Return entry as-is if no valid fid or last_name
        return { 
          ...entry, 
          pfp: '/defifa_spinner.gif', 
          team: { name: 'N/A', logo: '/defifa_spinner.gif' },
          manager: 'FID not set 🤦🏽‍♂️' 
        };
      })
    );

    return updatedFantasyData; // Return the updated data array
  } catch (err) {
    console.error("Error fetching fantasy data:", err);
    throw new Error('Failed to fetch fantasy data');
  }
};
