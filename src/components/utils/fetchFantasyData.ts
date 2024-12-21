// utils/fetchFantasyData.ts

import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { Database } from '../../../supabase';

const openAiApiKey = process.env.NEXT_PUBLIC_API_AIRSTACK || '';
const supabaseApiKey = process.env.NEXT_PUBLIC_API_SUP || '';

const supabase = createClient<Database>(
  'https://tjftzpjqfqnbtvodsigk.supabase.co',
  supabaseApiKey
);

export const fetchFantasyData = async () => {
  try {
    // Query the 'standings' table for 'entry_name', 'rank', 'last_name', and 'fav_team'
    const { data, error } = await supabase
      .from('standings')
      .select('entry_name, rank, last_name, fav_team, total');

    if (error) {
      throw error;
    }

    // Step 1: Concurrently fetch profile images for each entry with valid fid
    const updatedFantasyData = await Promise.all(
      data.map(async (entry) => {
        const { last_name, fav_team } = entry;

        // Ensure last_name is not null and is a valid number (fid)
        if (last_name && !isNaN(Number(last_name))) {
          const fid = parseInt(last_name, 10); // Ensure fid is an integer
          // Check if fid is a valid integer
          if (Number.isInteger(fid)) {
            const server = "https://hubs.airstack.xyz";
            try {
              // Make the API call using the fid
              const response = await axios.get(`${server}/v1/userDataByFid?fid=${fid}`, {
                headers: {
                  "Content-Type": "application/json",
                  "x-airstack-hubs": openAiApiKey
                }
              });

              // Extract pfp URL from the response
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
              
              // Step 2: Fetch team info from the 'teams' table based on fav_team
              let teamInfo = null;
              if (fav_team) {
                const { data: teamData, error: teamError } = await supabase
                  .from('teams')
                  .select('name, logo')
                  .eq('id', fav_team)
                  .single(); // Assume fav_team maps to one team only

                if (teamError) {
                  console.error("Error fetching team data", teamError);
                } else {
                  teamInfo = teamData;
                }
              }

              // If no team info, use a default team logo (defifa_spinner.gif)
              if (!teamInfo) {
                teamInfo = { name: 'N/A', logo: '/defifa_spinner.gif' };
              }

              // Return updated entry with pfpUrl and teamInfo
              return {
                ...entry, 
                pfp: pfpUrl || '/defifa_spinner.gif', // Use a fallback pfp if not found
                team: teamInfo, 
                manager: username || 'anon', 
              };
            } catch (e) {
              console.error("Error fetching data from API", e);
              return { ...entry, pfp: '/defifa_spinner.gif' }; // Fallback on error
            }
          }
        }

        // Return the entry as-is if no valid fid or last_name
        return { ...entry, pfp: '/defifa_spinner.gif', team: { name: 'N/A', logo: '/defifa_spinner.gif' }, manager: 'FID not set 🤦🏽‍♂️' };
      })
    );

    return updatedFantasyData;
  } catch (err) {
    console.error("Error fetching fantasy data:", err);
    throw new Error('Failed to fetch fantasy data');
  }
};
