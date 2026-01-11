import React, { createContext, useState, useCallback } from "react";

export const AchievementContext = createContext();

export const AchievementProvider = ({ children }) => {
	// Queue of achievements to show
	const [achievementQueue, setAchievementQueue] = useState([]);
	// Currently displayed achievement
	const [currentAchievement, setCurrentAchievement] = useState(null);
	// Modal open state
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Add achievements to the queue
	const queueAchievements = useCallback((achievements) => {
		if (!achievements || achievements.length === 0) return;

		setAchievementQueue((prev) => [...prev, ...achievements]);
	}, []);

	// Show the next achievement in the queue
	const showNextAchievement = useCallback(() => {
		setAchievementQueue((prev) => {
			if (prev.length === 0) {
				setCurrentAchievement(null);
				setIsModalOpen(false);
				return prev;
			}

			const [next, ...rest] = prev;
			setCurrentAchievement(next);
			setIsModalOpen(true);
			return rest;
		});
	}, []);

	// Close the current achievement modal and show next
	const closeAchievementModal = useCallback(() => {
		setIsModalOpen(false);
		// Small delay before showing next achievement
		setTimeout(() => {
			showNextAchievement();
		}, 300);
	}, [showNextAchievement]);

	// Process new achievements - entry point
	const processNewAchievements = useCallback(
		(achievements) => {
			if (!achievements || achievements.length === 0) return;

			// If no modal is currently open, show the first one immediately
			if (!isModalOpen && !currentAchievement) {
				const [first, ...rest] = achievements;
				setCurrentAchievement(first);
				setIsModalOpen(true);
				if (rest.length > 0) {
					setAchievementQueue((prev) => [...prev, ...rest]);
				}
			} else {
				// Otherwise queue them all
				queueAchievements(achievements);
			}
		},
		[isModalOpen, currentAchievement, queueAchievements]
	);

	return (
		<AchievementContext.Provider
			value={{
				currentAchievement,
				isModalOpen,
				achievementQueue,
				processNewAchievements,
				closeAchievementModal,
				queueLength: achievementQueue.length,
			}}
		>
			{children}
		</AchievementContext.Provider>
	);
};
