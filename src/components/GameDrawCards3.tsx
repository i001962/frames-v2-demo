import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { fetchPlayerElements } from "./utils/fetchPlayerElements";

// Player cards data with additional fields: Position, xGoals90m, xConceded90m
/* const players = [
  {
    id: 1,
    name: "Player 1",
    image:
      "https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/223723.png",
    position: "Forward",
    xGoals90m: 0.5,
    xConceded90m: 0.3,
  },
  {
    id: 2,
    name: "Player 2",
    image:
      "https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/114241.png",
    position: "Midfielder",
    xGoals90m: 0.3,
    xConceded90m: 0.1,
  },
  {
    id: 3,
    name: "Player 3",
    image:
      "https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/116535.png",
    position: "Defender",
    xGoals90m: 0.1,
    xConceded90m: 0.4,
  },
  {
    id: 4,
    name: "Player 4",
    image:
      "https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/172780.png",
    position: "Goalkeeper",
    xGoals90m: 0.0,
    xConceded90m: 0.2,
  },
  {
    id: 5,
    name: "Player 5",
    image:
      "https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/209289.png",
    position: "Forward",
    xGoals90m: 0.6,
    xConceded90m: 0.3,
  },
]; */

const PlayerCardScroll = () => {
  // State to keep track of cart items with quantities
  const [cartItems, setCartItems] = useState<Map<number, number>>(new Map());
  // Timer state
  const [timer, setTimer] = useState<number>(10);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [isCheckedOut, setIsCheckedOut] = useState<boolean>(false); // Track checkout status
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch player data from the API
  useEffect(() => {
    const getPlayerData = async () => {
      try {
        const data = await fetchPlayerElements();
        console.log('in Kmac Attackers score', data);
        const filteredPlayers = data.filter(data => data.minutes > 1000);

        // Sort the players based on expected goals per 90 minutes
        const sortedPlayers = filteredPlayers.sort((a, b) => {
          const xgiPer90A = (a.expected_assists_per_90 * 3)+(a.expected_goals_per_90 * 5);
          const xgiPer90B = (b.expected_assists_per_90 * 3)+(b.expected_goals_per_90 * 5);
          return xgiPer90B - xgiPer90A; // Sort in descending order
        });

        // Only take the top 2 players
        const topPlayers = sortedPlayers.slice(0, 20);

        setPlayers(topPlayers);
        console.log('data', topPlayers);
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    getPlayerData();
  }, []); // Ensure this useEffect runs only once on mount

  // Start the timer when the first card is added to the cart
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer <= 0) {
      setTimerRunning(false); // Stop the timer when it reaches 0
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerRunning, timer]); // This effect is purely related to timer

  // Handle adding/removing cards from the cart
  const handleCardClick = (card: typeof players[0]) => {
    if (timer <= 0) {
      return; // Prevent adding cards when the timer ends
    }

    setCartItems((prevCart) => {
      const newCart = new Map(prevCart);
      const currentQuantity = newCart.get(card.id) || 0;
      if (currentQuantity > 0) {
        // If the card is already in the cart, increment its quantity
        newCart.set(card.id, currentQuantity + 1);
      } else {
        // If the card is not in the cart, add it with quantity 1
        newCart.set(card.id, 1);
      }
      return newCart;
    });

    if (!timerRunning) {
      // Start the timer when the first card is added
      setTimerRunning(true);
    }
  };

  // Handle removing a card from the cart
  const handleRemoveCard = (card: typeof players[0]) => {
    setCartItems((prevCart) => {
      const newCart = new Map(prevCart);
      const currentQuantity = newCart.get(card.id) || 0;
      if (currentQuantity > 1) {
        // If the card is in the cart with quantity > 1, decrement its quantity
        newCart.set(card.id, currentQuantity - 1);
      } else {
        // If quantity is 1, remove the card completely
        newCart.delete(card.id);
      }
      return newCart;
    });
  };

  // Handle checkout
  const handleCheckout = () => {
    console.log("Checking out with the following items:");
    Array.from(cartItems.entries()).forEach(([id, quantity]) => {
      const card = players.find((card) => card.id === id);
      if (card) {
        console.log(`${card.name} - Quantity: ${quantity}`);
      }
    });
    setIsCheckedOut(true); // Mark as checked out
  };

  return (
      <div className="mb-4">
        {/* Horizontal Scrollable Menu for Tabs */}
        <h2 className="font-2xl text-notWhite font-bold mb-4">Guess Top Scorers</h2>
       
      {/* Player Cards Scroll */}
      <div className="flex overflow-x-auto space-x-4 mb-4 sticky top-0 z-10 bg-darkPurple p-4">
        {players.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`flex-shrink-0 py-2 px-6 text-sm font-semibold cursor-pointer rounded-lg border-2 ${
              cartItems.get(card.id) > 0
                ? "border-limeGreenOpacity text-lightPurple"
                : "border-gray-500 text-notWhite"
            }`}
          >
            <img
              src={card.code}
              alt={card.webName}
              className="w-32 h-32 object-cover rounded-lg mb-2"
            />
            <div className="text-center">{card.webName}</div>
            <div className="text-xs text-center text-lightPurple">{card.position}</div>
            <div className="text-xs text-center text-gray-400">
              xGoal Invovle 90m: {card.xgi90.toFixed(2)}
            </div>
            <div className="text-xs text-center text-gray-400">
              xConceded 90m: {card.xgc90.toFixed(2)}
            </div>
            {/* Show remove button if the card is in the cart */}
            {cartItems.get(card.id) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-lightPurple ml-2">
                  Quantity: {cartItems.get(card.id)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the onClick of the parent
                    handleRemoveCard(card);
                  }}
                  className="mt-2 text-xs bg-deepPink text-white py-1 px-3 rounded"
                >
                  -
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-6 p-4 bg-gray-800 text-lightPurple rounded-lg">
        <h3 className="font-semibold text-notWhite text-lg">Selected</h3>
        <div>
          {cartItems.size === 0 ? (
            <p>No players selected</p>
          ) : (
            <ul>
              {Array.from(cartItems.entries()).map(([id, quantity]) => {
                const card = players.find((card) => card.id === id);
                return (
                  <li key={id} className="mb-2">
                    {card?.webName} - {quantity}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Timer Display */}
      <div className="mt-6 p-4 text-white">
        {timer > 0 ? (
          <p>Time remaining: {timer}s</p>
        ) : (
          <>
            <Button onClick={() => setTimer(10)}>Reset Timer</Button>
            {/* Show Checkout Button after the timer ends */}
            {!isCheckedOut && (
              <button
                onClick={handleCheckout}
                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Checkout
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerCardScroll;
