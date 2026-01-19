import { useState, useEffect, useCallback, useRef } from "react";

export default function useGameTimer(initialTime = 10, isActive = true) {
	const [timeLeft, setTimeLeft] = useState(initialTime);
	const [isRunning, setIsRunning] = useState(false);
	const [hasExpired, setHasExpired] = useState(false);
	const intervalRef = useRef(null);

	// Start the timer
	const start = useCallback(() => {
		setIsRunning(true);
		setHasExpired(false);
	}, []);

	// Pause the timer
	const pause = useCallback(() => {
		setIsRunning(false);
	}, []);

	// Reset the timer
	const reset = useCallback(
		(newTime = initialTime) => {
			setTimeLeft(newTime);
			setHasExpired(false);
			setIsRunning(false);
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		},
		[initialTime],
	);

	// Restart the timer (reset and start)
	const restart = useCallback(
		(newTime = initialTime) => {
			setTimeLeft(newTime);
			setHasExpired(false);
			setIsRunning(true);
		},
		[initialTime],
	);

	// Timer effect
	useEffect(() => {
		if (!isRunning || !isActive) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			return;
		}

		intervalRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					setIsRunning(false);
					setHasExpired(true);
					clearInterval(intervalRef.current);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isRunning, isActive]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	// Format time as MM:SS
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return {
		timeLeft,
		formattedTime: formatTime(timeLeft),
		isRunning,
		hasExpired,
		start,
		pause,
		reset,
		restart,
		totalTime: initialTime,
	};
}
