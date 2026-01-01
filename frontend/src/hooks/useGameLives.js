import { useState, useCallback } from 'react';

export default function useGameLives(initialLives = 3) {
  const [lives, setLives] = useState(initialLives);
  const [maxLives] = useState(initialLives);
  const [isGameOver, setIsGameOver] = useState(false);

  // Lose a life
  const loseLife = useCallback(() => {
    setLives((prev) => {
      const newLives = Math.max(0, prev - 1);
      if (newLives === 0) {
        setIsGameOver(true);
      }
      return newLives;
    });
  }, []);

  // Gain a life (optional bonus)
  const gainLife = useCallback(() => {
    setLives((prev) => Math.min(maxLives, prev + 1));
  }, [maxLives]);

  // Reset lives
  const reset = useCallback((newLives = initialLives) => {
    setLives(newLives);
    setIsGameOver(false);
  }, [initialLives]);

  // Check if player is alive
  const isAlive = lives > 0;

  return {
    lives,
    maxLives,
    isAlive,
    isGameOver,
    loseLife,
    gainLife,
    reset,
  };
}
