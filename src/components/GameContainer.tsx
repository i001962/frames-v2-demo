import { useEffect, useState } from "react";

class CardGame {
  n_players: number;
  time_limit: number;
  n_cards: number;
  colors: string[];
  players: Player[];

  constructor(n_players: number, time_limit: number, n_cards: number) {
    this.n_players = n_players;
    this.time_limit = time_limit;
    this.n_cards = n_cards;
    this.colors = ['Red', 'Yellow', 'Green', 'Blue', 'Purple'];
    this.players = Array.from({ length: n_players }, (_, i) => new Player(i, this));
  }

  start(): void {
    this.draw_phase();
    // Implement voting_phase if needed
  }

  draw_phase(): void {
    const start_time = Date.now();
    while (Date.now() - start_time < this.time_limit) {
      for (const player of this.players) {
        player.draw_cards();
        if (player.has_max_cards()) {
          break;
        }
      }
    }
  }
}

class Player {
  id: number;
  cards: { [color: string]: number };
  pot_winnings: number;
  game: CardGame;

  constructor(id: number, game: CardGame) {
    this.id = id;
    this.cards = {};
    this.pot_winnings = 0;
    this.game = game;
  }
  
  // Helper method to generate a random integer between min and max (inclusive)
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  has_max_cards(): boolean {
    return this.game.colors.some(color => this.cards[color] === this.game.n_cards);
  }

  draw_cards(): string[] {
    let drawActions: string[] = [];
    const n_cards = this.randomInt(0, this.game.n_cards + 1);
    this.cards = this.game.colors.reduce((acc, color) => {
      const maxVal = Math.max(2, n_cards + 1);
      acc[color] = this.randomInt(0, maxVal);

      // Record the draw action
      drawActions.push(`Player ${this.id} drew ${acc[color]} ${color} cards.`);

      return acc;
    }, {} as { [color: string]: number });

    return drawActions;
  }
}

const GameContainer = () => {
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [playerCardDistribution, setPlayerCardDistribution] = useState<Record<number, Record<string, number>>>({}); // Player ID mapped to color and card count
    const [totalsByColor, setTotalsByColor] = useState<Record<string, number>>({}); // Totals for each color
    const [totalCardsPerPlayer, setTotalCardsPerPlayer] = useState<Record<number, number>>({}); // Total cards per player
    const totalCardsAllPlayers = Object.values(totalCardsPerPlayer).reduce((sum, current) => sum + current, 0);
    const colors = ['Red', 'Yellow', 'Green', 'Blue', 'Purple']; // assuming these are the only colors
    const [nPlayers, setNPlayers] = useState(0);

    type ColorClassType = {
        Red: string;
        Yellow: string;
        Green: string;
        Blue: string;
        Purple: string;
        White: string;
    };

    const colorClasses: { [key: string]: string } = {
        Red: 'text-red-700',
        Yellow: 'text-yellow-500',
        Green: 'text-green-500',
        Blue: 'text-blue-500',
        Purple: 'text-purple-500',
        White: 'text-white',
    };

    useEffect(() => {
        const n_players = 5;
        const time_limit = 10;
        const n_cards = 10;
        const game = new CardGame(n_players, time_limit, n_cards);
        game.start();

        let distribution: Record<number, Record<string, number>> = {};
        game.players.forEach(player => {
            const playerDraws = player.draw_cards();
            distribution[player.id] = playerDraws.reduce((acc, drawAction) => {
                const [_, drawCount, color] = drawAction.match(/drew (\d+) (\w+) cards/)!;
                acc[color] = (acc[color] || 0) + parseInt(drawCount);
                return acc;
            }, {} as Record<string, number>);
        });

        setPlayerCardDistribution(distribution);

        let colorTotals: Record<string, number> = {};
        let playerTotals: Record<number, number> = {};
        game.players.forEach(player => {
            let playerTotal = 0;
            const playerDraws = player.draw_cards();
            distribution[player.id] = playerDraws.reduce((acc, drawAction) => {
                const [_, drawCount, color] = drawAction.match(/drew (\d+) (\w+) cards/)!;
                const count = parseInt(drawCount);
                acc[color] = (acc[color] || 0) + count;

                // Update totals
                playerTotal += count;
                colorTotals[color] = (colorTotals[color] || 0) + count;

                return acc;
            }, {} as Record<string, number>);
            playerTotals[player.id] = playerTotal;
        });

        setPlayerCardDistribution(distribution);
        setTotalsByColor(colorTotals);
        setTotalCardsPerPlayer(playerTotals);
        setNPlayers(n_players);

    }, []);

    useEffect(() => {
        const tableJson = createTableDataJson();
        console.log(tableJson); // for debugging
        // You can use tableJson as needed here
      }, [playerCardDistribution, totalsByColor, totalCardsPerPlayer, totalCardsAllPlayers]);
    
    interface CardsByColor {
        [color: string]: {
          cardCount: number;
          potShare: string;
          roi: string;
        };
      }
      
    interface PlayerData {
        cardsByColor: CardsByColor;
        playerId?: string;
        totalCards?: number;
        totalPercentageOfPot?: string;
        // ... other properties of PlayerData
      }

    let playerData: PlayerData = {
        cardsByColor: {} // other properties initialized as needed
      };

    interface CardColorData {
        cardCount: number;
        percentageOfPot: string; // assuming this function returns a number
      }

      interface TotalsData {
        totalCardsByColor: { [color: string]: CardColorData };
        totalCardsAllPlayers: number; // assuming totalCardsAllPlayers is a number
      }
    // Creating JSON for the totals row
      let totalsData:TotalsData = {
        totalCardsByColor: {},
        totalCardsAllPlayers: totalCardsAllPlayers
      };
      const createTableDataJson = () => {
        let tableData = [];
    
        // Debug: Log the state variables to ensure they hold the expected data
        console.log("playerCardDistribution", playerCardDistribution);
        console.log("totalsByColor", totalsByColor);
        console.log("totalCardsPerPlayer", totalCardsPerPlayer);
    
        Object.entries(playerCardDistribution).forEach(([playerId, cardCounts]) => {
            let playerData:PlayerData = {
                playerId: playerId,
                cardsByColor: {},
                totalCards: totalCardsPerPlayer[Number(playerId)],
                totalPercentageOfPot: calculateCellPercentage(totalCardsPerPlayer[Number(playerId)])
            };
    
            colors.forEach(color => {
                const count = cardCounts[color] || 0;
                const playerShareOfPot = calculatePlayerShareOfPot(count, totalsByColor[color], totalCardsAllPlayers);
                const roi = totalCardsPerPlayer[Number(playerId)] > 0 ? ((playerShareOfPot - totalCardsPerPlayer[Number(playerId)]) / totalCardsPerPlayer[Number(playerId)]) * 100 : 0;
    
                playerData.cardsByColor[color.toString()] = {
                    cardCount: count,
                    potShare: playerShareOfPot.toFixed(2),
                    roi: roi.toFixed(2)
                };
            });
    
            tableData.push(playerData);
        });

    
        colors.forEach(color => {
            totalsData.totalCardsByColor[color] = {
                cardCount: totalsByColor[color] || 0,
                percentageOfPot: calculateCellPercentage(totalsByColor[color])
            };
        });
    
        tableData.push(totalsData);
    
        return tableData;
    };
    
    const copyJsonToClipboard = () => {
        const tableJson = createTableDataJson();
        const jsonStr = JSON.stringify(tableJson, null, 2); // Convert JSON object to string with formatting
        navigator.clipboard.writeText(jsonStr).then(() => {
            alert("JSON copied to clipboard! TODO - send to AI Degen");
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    // Function to calculate the percentage
    const calculatePercentage = (count: number, total: number) => {
        if (total === 0) return 0;
        const percentage = (count / total) * 100;
        return `${percentage.toFixed(2)}`;
    };

     // Function to get cell class based on percentage
     const getCellClass = (percentage: number) => {
        return percentage >= 50 ? "bg-deepPink text-notWhite" : "";
    };

    const calculateCellPercentage = (cellValue: number) => {
        if (totalCardsAllPlayers === 0) return "0%";
        const percentage = (cellValue / totalCardsAllPlayers) * 100;
        return `${percentage.toFixed(2)}%`;
    };

    const calculatePlayerShareOfPot = (playerCount: number, teamTotal: number, potTotal: number) => {
        if (teamTotal === 0) return 0;
        const teamPercentage = (playerCount / teamTotal) * 100;
        return (teamPercentage / 100) * potTotal;
    };

    return (
        <div className="container bg-darkPurple mx-auto mt-5">
            <table className="table-auto w-full border-collapse border border-deepPink">
                <thead>
                    <tr>
                    <th className="border border-deepPink px-4 py-2 text-lg text-notWhite">Player/Team</th>
                    {colors.map(color => {
                        const textColorClass = colorClasses[color] || ''; 
                        return (
                            <th key={color} className={`border border-deepPink px-4 py-2 text-lg  ${textColorClass}`}>{color}</th>
                        );
                    })}              
                        <th className="border border-deepPink px-4 py-2 text-lg text-notWhite">Total</th>
                    </tr>
                </thead>
                <tbody>
                {Object.entries(playerCardDistribution).map(([playerId, cardCounts]) => {
                    const totalCardsByPlayer = Object.values(cardCounts).reduce((sum, count) => sum + count, 0);
                    // Calculate ROIs for each color and find the highest ROI
                    const rois = colors.map(color => {
                        const count = cardCounts[color] || 0;
                        const playerShareOfPot = calculatePlayerShareOfPot(count, totalsByColor[color], totalCardsAllPlayers);
                        return totalCardsByPlayer > 0 ? ((playerShareOfPot - totalCardsByPlayer) / totalCardsByPlayer) * 100 : 0;
                    });
                    const maxRoi = Math.max(...rois);   
                    
                    const getTextColorClass = (roi: number, count: number, color: string) => {
                        if (count === 0) return ''; // No text color class needed for empty cells
                        return roi <= 0 ? 'text-gray-50' : colorClasses[color]; // Use text-white for negative ROI, otherwise use the color class
                    };
                    
                    return (
                        <tr key={playerId}>
                            <td className="border border-deepPink px-4 py-2 text-lg text-notWhite font-bold">Player {playerId}</td>
                            {colors.map((color, index) => {
                       
                            const count = cardCounts[color] || 0;
                            const playerShareOfPot = calculatePlayerShareOfPot(count, totalsByColor[color], totalCardsAllPlayers);
                            let roi = rois[index];
                            let cellClass = `border border-deepPink px-4 py-2 text-md text-opacity-70`;

                            // Apply different classes based on ROI, but only if there are cards (count > 0)
                            if (count > 0) {
                                const textColorClass = getTextColorClass(roi, count, color);
                                const positiveRoiClass = roi > 0 ? "bg-darkPurple" : "";
                                const negativeRoiClass = roi <= 0 ? "bg-deepPink" : "";
                                cellClass += ` ${textColorClass} ${positiveRoiClass} ${negativeRoiClass}`;
                            }

                            return (
                                <td key={color} className={cellClass}>
                                    {count > 0 ? (
                                        <>
                                            <div>{count} cards</div>
                                            <div>${playerShareOfPot.toFixed(2)} payout</div>
                                            <div>{roi.toFixed(2)}% ROI</div>
                                        </>
                                    ) : null}
                                </td>
                            );
                        })}
                        <td className="border border-deepPink px-4 py-2 text-md text-notWhite">
                                <div className="text-lightPurple">{totalCardsPerPlayer[Number(playerId)]} cards</div>
                                <div> {calculateCellPercentage(totalCardsPerPlayer[Number(playerId)])} of pot</div>
                            </td>
                        </tr>
                    );
                    })}
                    <tr>
                        <td className="border border-deepPink px-4 py-2 text-lg text-notWhite font-bold">Total</td>
                        {colors.map(color => {
                            const totalColorCount = totalsByColor[color] || 0;
                            // Count of players who have drawn cards for this color
                            const playersWithCardsCount = Object.values(playerCardDistribution).filter(playerCounts => playerCounts[color] > 0).length;
                            // Count of players with positive ROI for this color
                            const positiveRoiCount = Object.values(playerCardDistribution).reduce((count, playerCounts) => {
                            const playerCountForColor = playerCounts[color] || 0;
                            const totalPlayerCount = Object.values(playerCounts).reduce((sum, cnt) => sum + cnt, 0); // Total cards drawn by the player across all colors
                            // Calculate player's share of the pot for this color
                            const playerShareOfPot = calculatePlayerShareOfPot(playerCountForColor, totalColorCount, totalCardsAllPlayers);
                            // Calculate ROI based on total player involvement and share of pot for this color
                            const playerRoi = totalPlayerCount > 0 ? ((playerShareOfPot - totalPlayerCount) / totalPlayerCount) * 100 : 0;
                            // Check for positive ROI
                            if (playerRoi > 0) {
                                return count + 1; // Increment only if ROI for this color is positive
                            }
                            return count;
                            }, 0);
                            
                            return (
                                <td key={color} className="border border-deepPink px-4 py-2 text-md text-notWhite">
                                    <div className="text-lightPurple">{totalColorCount} cards</div>  
                                    <div>{calculateCellPercentage(totalColorCount)} of pot</div>
                                    <div>{positiveRoiCount} of {playersWithCardsCount} win</div>
                                </td>
                                );
                        })}

                        <td className="border border-deepPink px-4 py-2 text-md text-notWhite">
                            <div className="text-lightPurple"> {totalCardsAllPlayers} total cards</div>
                            <div>100%</div>
                            <button 
                                className="bg-green-500 hover:bg-limeGreen text-white font-bold py-2 px-4 rounded"
                                onClick={copyJsonToClipboard}>
                                Ask 🎩 AI mentor
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default GameContainer;