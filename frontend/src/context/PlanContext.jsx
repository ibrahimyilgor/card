import React, {
	createContext,
	useState,
	useCallback,
	useContext,
	useEffect,
} from "react";
import { getMyPlan, getLimitStatus } from "../services/accountServices";

export const PlanContext = createContext();

export const PlanProvider = ({ children, user }) => {
	// Plan information
	const [planInfo, setPlanInfo] = useState(null);
	// Limit status information
	const [limitStatus, setLimitStatus] = useState(null);
	// Loading state
	const [loading, setLoading] = useState(true);
	// Error state
	const [error, setError] = useState(null);

	// Fetch plan info
	const fetchPlanInfo = useCallback(async () => {
		try {
			const response = await getMyPlan();
			setPlanInfo(response.data);
			return response.data;
		} catch (err) {
			console.error("Failed to fetch plan info:", err);
			setError(err);
			return null;
		}
	}, []);

	// Fetch limit status
	const fetchLimitStatus = useCallback(async () => {
		try {
			const response = await getLimitStatus();
			setLimitStatus(response.data);
			return response.data;
		} catch (err) {
			console.error("Failed to fetch limit status:", err);
			setError(err);
			return null;
		}
	}, []);

	// Refresh all plan data
	const refreshPlanData = useCallback(async () => {
		setLoading(true);
		try {
			await Promise.all([fetchPlanInfo(), fetchLimitStatus()]);
		} finally {
			setLoading(false);
		}
	}, [fetchPlanInfo, fetchLimitStatus]);

	// Fetch plan data when user is available
	useEffect(() => {
		if (user) {
			refreshPlanData();
		} else {
			setPlanInfo(null);
			setLimitStatus(null);
			setLoading(false);
		}
	}, [user, refreshPlanData]);

	// Computed properties
	const canPlay = limitStatus?.canPlay ?? true;
	const canCreateDeck = limitStatus?.canCreateDeck ?? true;
	const canCreateFlashcard = limitStatus?.canCreateFlashcard ?? true;
	// Ads disabled until AdSense approval — keep the flag ready for re-enable
	const hasAds = false; // limitStatus?.hasAds ?? false;
	const advancedStats = limitStatus?.advancedStats ?? false;
	const planCode = limitStatus?.planCode ?? "free";

	// Current usage
	const currentDecks = limitStatus?.currentDecks ?? 0;
	const currentFlashcards = limitStatus?.currentFlashcards ?? 0;
	const maxDecks = limitStatus?.maxDecks;
	const maxFlashcards = limitStatus?.maxFlashcards;
	const deckOverage = limitStatus?.deckOverage ?? 0;
	const flashcardOverage = limitStatus?.flashcardOverage ?? 0;

	// Check if user is over limit
	const isOverLimit = deckOverage > 0 || flashcardOverage > 0;

	// Generate detailed limit message
	const getLimitMessage = useCallback(() => {
		if (!isOverLimit) return null;

		let message = "";
		if (deckOverage > 0) {
			message += `Deck limitiniz ${maxDecks}, mevcut deck sayınız ${currentDecks}. ${deckOverage} deck silmeniz gerekiyor.\n`;
		}
		if (flashcardOverage > 0) {
			message += `Flashcard limitiniz ${maxFlashcards}, mevcut flashcard sayınız ${currentFlashcards}. ${flashcardOverage} flashcard silmeniz gerekiyor.\n`;
		}
		message += "Veya planınızı yükseltin.";
		return message;
	}, [
		isOverLimit,
		deckOverage,
		flashcardOverage,
		maxDecks,
		currentDecks,
		maxFlashcards,
		currentFlashcards,
	]);

	return (
		<PlanContext.Provider
			value={{
				// Plan info
				planInfo,
				planCode,
				// Limit status
				limitStatus,
				currentDecks,
				currentFlashcards,
				maxDecks,
				maxFlashcards,
				deckOverage,
				flashcardOverage,
				// Computed flags
				canPlay,
				canCreateDeck,
				canCreateFlashcard,
				hasAds,
				advancedStats,
				isOverLimit,
				// Utilities
				getLimitMessage,
				refreshPlanData,
				fetchLimitStatus,
				// State
				loading,
				error,
			}}
		>
			{children}
		</PlanContext.Provider>
	);
};

// Custom hook for using plan context
export const usePlan = () => {
	const context = useContext(PlanContext);
	if (!context) {
		throw new Error("usePlan must be used within a PlanProvider");
	}
	return context;
};
