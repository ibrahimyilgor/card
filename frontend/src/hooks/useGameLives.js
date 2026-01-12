import { useState, useCallback } from "react";

export default function useGameLives(initialLives = 3) {
	const [lives, setLives] = useState(initialLives);
	const [maxLives, setMaxLives] = useState(initialLives);
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

	// Reset lives (also updates maxLives if a new value is provided)
	const reset = useCallback(
		(newLives) => {
			if (newLives !== undefined) {
				setLives(newLives);
				setMaxLives(newLives);
			} else {
				setLives(maxLives);
			}
			setIsGameOver(false);
		},
		[maxLives]
	);

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
