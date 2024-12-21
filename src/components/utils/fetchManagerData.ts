// utils/fetchManagerData.ts

import { createClient } from "@supabase/supabase-js";
import { Database } from '../../../supabase';

const supabaseApiKey = process.env.NEXT_PUBLIC_API_SUP || '';  // Ensure this key is available
const supabase = createClient<Database>(
  'https://tjftzpjqfqnbtvodsigk.supabase.co',
  supabaseApiKey
);

export const fetchManagerData = async (casterFid: number) => {
  try {
    const { data, error } = await supabase
      .from('standings')
      .select('fname, rank, last_name, total, fav_team')
      .eq('last_name', String(casterFid))
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      if (data.fav_team !== null) {
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name')
          .eq('id', data.fav_team)
          .single();

        if (teamsError) {
          throw teamsError;
        }

        const userInfo = {
          username: data.fname,
          total: data.total,
          teamName: teamsData?.name || "No team set"
        };

        return userInfo;
      } else {
        return { username: data.fname, total: data.total, teamName: "No team set" };
      }
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    return null;
  }
};
