import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';

type Suit = 'Red' | 'Yellow' | 'Blue' | 'Green'| 'Purple';
type Card = { suit: Suit; number: number };

const suitImages: Record<Suit, string> = {
    Red: 'https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/223723.png',
    Yellow: 'https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/114241.png',
    Blue: 'https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/116535.png',
    Green: 'https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/172780.png',
    Purple: 'https://tjftzpjqfqnbtvodsigk.supabase.co/storage/v1/object/public/d33m_images/epl_players/209289.png'
  };

const drawTime = 8;

type DrawCardsProps = {
  onCardDraw: (suit: Suit) => void;
};

const GameDrawCards2: React.FC<DrawCardsProps> = ({ onCardDraw }) => {
  const [cardStacks, setCardStacks] = useState<Record<Suit, Card[]>>({
    Red: [],
    Yellow: [],
    Blue: [],
    Green: [],
    Purple: []
  });
  const [totalCardsDrawn, setTotalCardsDrawn] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(drawTime);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [gamePhase, setGamePhase] = useState('Not Started'); // 'Not Started', 'Draw', 'Negotiate', 'Fold'

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer <= 0) {
      clearInterval(interval);
      setGamePhase('Negotiate'); // Move to negotiate phase when timer reaches 0
      setIsTimerActive(false); // Stop the timer
    }

    return () => clearInterval(interval);
  }, [gamePhase, timer]);

  const handleSuitTap = (suit: Suit) => {
    // Start the game and timer when the first card section is clicked
    if (!gameStarted) {
      setGamePhase('Draw');
      setGameStarted(true);
      setIsTimerActive(true);
      setTimer(drawTime); // Reset timer to the starting time
    }

    // Prevent card selection if timer is not active or the game is not in "Draw" phase
    if (gamePhase !== 'Draw' || !isTimerActive || totalCardsDrawn >= 100) return;

    const newCard = { suit, number: cardStacks[suit].length + 1 };
    setCardStacks(prevStacks => ({ ...prevStacks, [suit]: [...prevStacks[suit], newCard] }));
    setTotalCardsDrawn(prevTotal => prevTotal + 1);
    onCardDraw(suit);
    const audioElement = new Audio('/soccer-ball-kick-37625.mp3');
    audioElement.play();
  };

  const handleReset = () => {
    setCardStacks({ Red: [], Yellow: [], Blue: [], Green: [], Purple: [] });
    setTotalCardsDrawn(0);
    setGameStarted(false);
    setGamePhase('Not Started');
    setIsTimerActive(false); // Stop the timer
    setTimer(drawTime); // Reset the timer to initial value
  };

  const handleFold = () => {
    setGamePhase('Not Started');
    setCardStacks({ Red: [], Yellow: [], Blue: [], Green: [], Purple: [] });
    setTotalCardsDrawn(0);
    setTimer(60); // Reset timer for the next game
    setIsTimerActive(false); // Stop the timer
  };

  const renderCards = (suit: Suit) => {
    const maxCascadingCards = 6; // Change from 5 to 2 to show only two cards
    return cardStacks[suit].slice(0, maxCascadingCards).map((card, index) => {
      const positionStyle = index < maxCascadingCards ?
                            { top: `${index * 10}px`, left: `${index * 10}px` } :
                            { top: `${(maxCascadingCards - 1) * 10}px`, left: `${(maxCascadingCards - 1) * 10}px` };

      return (
        <div key={index} className="absolute w-32 h-48 border border-black flex justify-center items-center bg-lightPurple rounded-lg" style={positionStyle}>
          <img src={suitImages[suit]} alt={`${suit} card`} className="w-full h-full object-cover border-1 rounded-lg border-gray-800" />
          <span className="absolute bottom-0 text-xs text-notWhite">{card.number}</span>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-4xl bg-purplePanel relative">
      {/* Button section moved to the top */}
      <div className="flex space-x-2 items-center mb-4">
        {gamePhase === 'Negotiate' && 
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" >
            Negotiate
          </button>
        }
        {(gamePhase === 'Draw' || gamePhase === 'Negotiate') && (
          <button className="bg-fontRed hover:bg-fontRed text-white font-bold py-2 px-4 rounded" onClick={handleFold}>
            Fold
          </button>
        )}
        <div className="text-white ml-4">
          {gamePhase === 'Draw' && `Time Left: ${timer}s`}
        </div>
      </div>

      <div className="flex justify-center space-x-6">
        {(['Red', 'Yellow', 'Blue', 'Green', 'Purple'] as Suit[]).map(suit => (
          <div key={suit} className="flex flex-col items-center">
            {/* Suit Image */}
            <div className={`mr-2 w-48 h-72 border border-black flex justify-center items-center cursor-pointer`} onClick={() => handleSuitTap(suit)}>
              <img src={suitImages[suit]} alt={`${suit} card`} className="w-full h-full object-cover rounded-lg border-2 border-gray-800 bg-lightPurple" />
            </div>
            <div className="relative w-48 h-72">
              {renderCards(suit)}
            </div>
            {/* Count Display - Show count only if greater than 0 */}
            {cardStacks[suit].length > 0 && (
              <div className="text-notWhite font-bold">
                {cardStacks[suit].length}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 m-4 text-white">
        Total Cards Drawn: {totalCardsDrawn}
      </div>
    </div>
  );
};

export default GameDrawCards2;
