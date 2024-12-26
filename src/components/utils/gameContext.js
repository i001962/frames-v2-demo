import React, { createContext, useState, useContext } from 'react';

// Define the shape of the game state
const initialState = {
  players: [], // Array to hold player card draw information
  // ... any other game state you need
};

const GameContext = createContext(initialState);

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const setPlayers = (players) => {
    setState(prevState => ({ ...prevState, players }));
  };

  // You can add more functions to modify different parts of the state

  return (
    <GameContext.Provider value={{ ...state, setPlayers }}>
      {children}
    </GameContext.Provider>
  );
};
