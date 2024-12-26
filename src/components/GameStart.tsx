// src/pages/index.tsx
import GameDrawCards from './GameDrawCards';
import { GameProvider } from './utils/gameContext';

const GameStart = () => {
    const [cardTotals, setCardTotals] = useState({ Red: 0, Yellow: 0, Blue: 0, Green: 0, Purple: 0 });
    const updateCardTotals = (suit) => {
      setCardTotals(prevTotals => ({ ...prevTotals, [suit]: prevTotals[suit] + 1 }));
    };
    return (
      <div>
        <GameProvider>
          < GameDrawCards onCardDraw={updateCardTotals} />
        </GameProvider>
      </div>
    );
  };
  
  export default GameStart;
  