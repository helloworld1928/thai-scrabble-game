import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GuestGameState {
  gameId: string;
  board: (string | null)[][];
  playerTiles: string[];
  aiTiles: string[];
  tileBag: string[];
  playerScore: number;
  aiScore: number;
  currentTurn: 'player' | 'ai';
  gameStatus: 'active' | 'finished';
  winner: 'player' | 'ai' | 'tie' | null;
}

interface GuestGameContextType {
  gameState: GuestGameState | null;
  createNewGame: () => void;
  saveGameState: (state: GuestGameState) => void;
  clearGame: () => void;
}

const GuestGameContext = createContext<GuestGameContextType | undefined>(undefined);

const STORAGE_KEY = 'guest_game_state';

export function GuestGameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GuestGameState | null>(null);

  // Load game state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load guest game state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const createNewGame = () => {
    const newGame: GuestGameState = {
      gameId: `guest_${Date.now()}`,
      board: Array(15).fill(null).map(() => Array(15).fill(null)),
      playerTiles: [],
      aiTiles: [],
      tileBag: [],
      playerScore: 0,
      aiScore: 0,
      currentTurn: 'player',
      gameStatus: 'active',
      winner: null,
    };
    setGameState(newGame);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGame));
  };

  const saveGameState = (state: GuestGameState) => {
    setGameState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const clearGame = () => {
    setGameState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <GuestGameContext.Provider value={{ gameState, createNewGame, saveGameState, clearGame }}>
      {children}
    </GuestGameContext.Provider>
  );
}

export function useGuestGame() {
  const context = useContext(GuestGameContext);
  if (context === undefined) {
    throw new Error('useGuestGame must be used within a GuestGameProvider');
  }
  return context;
}
