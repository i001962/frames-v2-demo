import React, { useState } from 'react';
import GameContainer from './GameContainer';
import DrawCards from './GameDrawCards';

const GameLauncher = () => {
  const [cardTotals, setCardTotals] = useState({ Red: 0, Yellow: 0, Blue: 0, Green: 0, Purple: 0 });
  const updateCardTotals = (suit: string | number) => {
    setCardTotals(prevTotals => ({ ...prevTotals, [suit]: prevTotals[suit] + 1 }));
  };

  return (
    <>
      <DrawCards onCardDraw={updateCardTotals} />
      <p>test</p>
      <GameContainer cardTotals={cardTotals} />
   </>
  )
}

export default GameLauncher;