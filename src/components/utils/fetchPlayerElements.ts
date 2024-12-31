// fetchPlayers.ts
import axios from 'axios';

interface Player {
  id: number;
  web_name: string;
  xgi90: number;
  xgc90: number;
  expected_goal_involvements_per_90: number;
  expected_goals_conceded_per_90: number;
  expected_goals_per_90: number;
  saves_per_90: number;
  expected_assists_per_90: number;
  minutes: number;
  element_type: number;
  team: number | string;
  code: number | string;
}

interface Team {
  id: number | string;
  name: string;
}

export const fetchPlayerElements = async () => {
  try {
    const response = await axios.get('https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/screenshots/bootstrap.json');
    const data = response.data;

    // Define position names for elements
    const positionNames = { 1: 'Gk', 2: 'Def', 3: 'Mid', 4: 'Fwd' };

    // Team abbreviations
    const teamAbbreviations: { [key: string]: string } = {
      'Arsenal': 'ars',
      'Aston Villa': 'avl',
      'Bournemouth': 'bou',
      'Brentford': 'bre',
      'Brighton': 'bha',
      'Chelsea': 'che',
      'Crystal Palace': 'cry',
      'Everton': 'eve',
      'Fulham': 'ful',
      'Ipswich': 'ips',
      'Leicester': 'lei',
      'Liverpool': 'liv',
      'Man City': 'mci',
      'Man Utd': 'mun',
      'Newcastle': 'new',
      "Nott'm Forest": 'not',
      'Southampton': 'sou',
      'Spurs': 'tot',
      'West Ham': 'whu',
      'Wolves': 'wol',
    };

    // Extract teams from the API
    const teams = data.teams.reduce((acc: { [x: string]: any; }, team: Team) => {
      acc[team.id] = team.name;
      return acc;
    }, {});

    // Process the players and add necessary data
    const playersWithStats = data.elements.map((player: Player) => {
      const teamName = teams[player.team]; // Get the full team name
      const teamAbbreviation = teamAbbreviations[teamName]; // Get the abbreviation from the map
      // console.log('teamAbbreviation', teamAbbreviation,teams[player.team]);
      // console.log('webName', player);
      return {
        id: player.id,
        webName: player.web_name,
        xgi90: player.expected_goal_involvements_per_90,
        xgc90: player.expected_goals_conceded_per_90,
        expected_goals_per_90: player.expected_goals_per_90,
        saves_per_90: player.saves_per_90,
        expected_assists_per_90: player.expected_assists_per_90,
        minutes: player.minutes,
        position: positionNames[player.element_type],
        code: player.code
          ? `https://resources.premierleague.com/premierleague/photos/players/250x250/p${player.code}.png`
          : '/defifa_spinner.gif',
        team: teamName,
        teamLogo: teamAbbreviation
          ? `https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/teams/${teamAbbreviation}.png`
          : '/assets/default-team-logo.png'
      };
    });

    return playersWithStats;
  } catch (error) {
    throw new Error('Error fetching player data');
  }
};
