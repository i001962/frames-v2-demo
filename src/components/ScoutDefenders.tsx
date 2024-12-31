import React from 'react';
import Image from 'next/image';

interface Players {
  id: number;
  webName: string;
  teamLogo: string;
  position: string;
  xgi90: number;
  xgc90: number;
  expected_goals_per_90: number;
  expected_assists_per_90: number;
  minutes: number;
  team: string;
}

interface ScoutDefendersProps {
  playersIn: Players[]; // Define the expected type for the playersIn prop
}

const ScoutDefenders: React.FC<ScoutDefendersProps> = ({ playersIn }) => {  // Destructure playersIn from props
  console.log('in scout defenders - players', playersIn);

  // Filter players based on minutes and position (Goalkeeper and Defender only)
  const filteredPlayers = playersIn.filter(
    player => player.minutes > 1000 && (player.position === 'Def')
  );

  // Sort the players based on xGC per 90 minutes (descending)
  const sortedPlayers = filteredPlayers.sort((a, b) => {
    const xgcPer90A = (a.xgi90 * 5) - a.xgc90;
    const xgcPer90B = (b.xgi90 * 5) - b.xgc90;
    return xgcPer90B - xgcPer90A; // Sort in descending order
  });

  // Only take the top 20 players
  const topPlayers = sortedPlayers.slice(0, 20);

  return (
    <div className="w-full h-full overflow-y-auto p-4 pr-2 pl-2">
      <table className="w-full bg-darkPurple border border-limeGreenOpacity rounded-lg shadow-lg overflow-hidden">
        <thead>
          <tr className="bg-darkPurple text-notWhite text-center border-b border-limeGreenOpacity">
            <th className="py-1 px-1 font-medium">Rank</th>
            <th className="py-1 px-1 font-medium">Player</th>
            <th className="py-1 px-1 font-medium">Team</th>
            <th className="py-1 px-1 font-medium">KMac Coeff</th>
            <th className="py-1 px-1 font-medium">xGc 90m</th>
            <th className="py-1 px-1 font-medium">xGi 90m</th>
          </tr>
        </thead>
        <tbody>
          {topPlayers.map((player, index) => (
            <tr key={player.id} className="border-b border-limeGreenOpacity hover:bg-purplePanel transition-colors text-lightPurple text-sm">
              <td className="py-1 px-1 text-center">
                <span className="mb-1">{index + 1}</span>
              </td>
              <td className="py-1 px-1">
                <div className="flex items-center justify-left space-x-2">
                  <span>{player.webName}</span>
                </div>
              </td>
              <td className="py-1 px-1 text-center">
                <Image src={player.teamLogo} alt={player.team} width={30} height={30} />
              </td>
              <td className="py-1 px-1 text-center">{(player.xgi90*5 - player.xgc90).toFixed(2)}</td>
              <td className="py-1 px-1 text-center">{player.xgc90.toFixed(2)}</td>
              <td className="py-1 px-1 text-center">{player.xgi90.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoutDefenders;
