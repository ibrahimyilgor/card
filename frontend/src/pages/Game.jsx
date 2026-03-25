import React, {
	useEffect,
	useState,
	useContext,
	useCallback,
	useRef,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSEO } from "../utils/seo";
import {
	getGameFlashcards,
	getHardFlashcards,
	getFlashcardsWithOptions,
	validateAnswer,
	updateFlashcardStats,
} from "../services/gameServices";
import { recordSession } from "../services/statsServices";
import { checkAchievements } from "../services/achievementServices";
import { AchievementContext } from "../context/AchievementContext";
import { usePlan } from "../context/PlanContext";
import { Box, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SpaceBarIcon from "@mui/icons-material/SpaceBar";
import StyleIcon from "@mui/icons-material/Style";
import GameSummary from "../components/GameSummary";
import GameSettingsModal from "../components/modals/GameSettingsModal";
import {
	KeyboardHint,
	GameProgress,
	AnswerButtons,
	GameHeader,
	CardView,
	WriteView,
	MultipleChoiceView,
	MatchView,
} from "../components/game";
import { useGameTimer, useGameLives } from "../hooks";
import { I18nContext } from "../utils/i18n";
import {
	PageContainer,
	EmptyState,
	VideoAdOverlay,
	LimitWarningModal,
} from "../components/ui";
import { playSound, preloadSounds, SOUNDS } from "../utils/sounds";

const MotionBox = motion.create(Box);
const WRITE_WRONG_DELAY_MS = 1200;
const WRITE_CORRECT_DELAY_MS = WRITE_WRONG_DELAY_MS / 10;

export default function Game({ onBackToDecks }) {
	const { deckId } = useParams();
	const location = useLocation();
	const { t } = useContext(I18nContext);
	const { processNewAchievements } = useContext(AchievementContext);

	// Plan context for ads and limit checks
	const {
		hasAds,
		isOverLimit,
		canPlay,
		currentDecks,
		maxDecks,
		deckOverage,
		currentFlashcards,
		maxFlashcards,
		flashcardOverage,
		planCode,
	} = usePlan();

	// Ad overlay state
	const [showAdOverlay, setShowAdOverlay] = useState(false);
	const [adShown, setAdShown] = useState(false);

	// Limit warning modal state
	const [limitWarningOpen, setLimitWarningOpen] = useState(false);

	// SEO meta tags for game page
	useSEO("game");

	// Preload all sounds immediately on mount so they're ready for the first card
	useEffect(() => {
		preloadSounds();
	}, []);

	// Get initial settings from navigation state, then manage locally
	const initialSettings = location.state?.settings || {
		mode: "standard",
		challengeType: "none",
		timeLimit: 60,
		lives: 3,
		cardDirection: "normal",
		hardModeEnabled: false,
	};
	const [settings, setSettings] = useState(initialSettings);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const gameMode = settings.mode || "standard";
	const challengeType = settings.challengeType || "none";
	const cardDirection = settings.cardDirection || "normal";
	const standardCardCount = Math.max(
		1,
		parseInt(settings.standardCardCount, 10) || 1,
	);
	const selectedCardCount =
		challengeType === "none" ? standardCardCount : Number.POSITIVE_INFINITY;
	const hardModeEnabled = settings.hardModeEnabled || false;

	// Debounce lock for answer processing
	const answerProcessingRef = useRef(false);

	// Core game state
	const [flashcards, setFlashcards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [scores, setScores] = useState({ correct: 0, incorrect: 0 });
	const [gameEnded, setGameEnded] = useState(false);
	const [isCardFlipped, setIsCardFlipped] = useState(false);
	const [direction, setDirection] = useState(0);

	// Mode-specific state
	const [writeResult, setWriteResult] = useState(null);
	const [selectedChoice, setSelectedChoice] = useState(null);
	const [showChoiceResult, setShowChoiceResult] = useState(false);
	const [gameStats, setGameStats] = useState({
		timeSpent: 0,
		matchAttempts: 0,
	});
	const [gameStartTime, setGameStartTime] = useState(null);

	// Custom hooks for timed and survival challenge types
	const timer = useGameTimer(
		settings.timeLimit || 60,
		challengeType === "timed",
	);
	const lives = useGameLives(settings.lives || 3);

	// Fetch flashcards
	const fetchFlashcards = useCallback(async () => {
		setLoading(true);
		try {
			let res;

			if (hardModeEnabled) {
				res = await getHardFlashcards(deckId);
			} else if (gameMode === "multiple_choice") {
				res = await getFlashcardsWithOptions(deckId, cardDirection);
			} else {
				res = await getGameFlashcards(deckId);
			}

			if (res.data && Array.isArray(res.data.flashcards)) {
				let cards = [...res.data.flashcards];
				const shuffledCards = [...cards].sort(() => Math.random() - 0.5);

				if (gameMode === "match") {
					cards =
						selectedCardCount === Number.POSITIVE_INFINITY
							? cards
							: shuffledCards.slice(
									0,
									Math.min(selectedCardCount, cards.length),
								);
				} else {
					cards =
						selectedCardCount === Number.POSITIVE_INFINITY
							? shuffledCards
							: shuffledCards.slice(
									0,
									Math.min(selectedCardCount, cards.length),
								);
				}

				setFlashcards(cards);
			} else {
				setFlashcards([]);
			}
		} catch (err) {
			console.error("Error fetching flashcards:", err);
			// Check if it's a plan limit error (403)
			if (
				err.response?.status === 403 &&
				err.response?.data?.error === "Plan limit exceeded"
			) {
				setLimitWarningOpen(true);
			}
			setFlashcards([]);
		} finally {
			setLoading(false);
		}
	}, [deckId, gameMode, hardModeEnabled, cardDirection, selectedCardCount]);

	useEffect(() => {
		fetchFlashcards();
	}, [fetchFlashcards]);

	// Set game start time when cards load
	useEffect(() => {
		if (!loading && flashcards.length > 0 && !gameStartTime) {
			setGameStartTime(Date.now());
		}
	}, [loading, flashcards.length, gameStartTime]);

	// Start timer when cards load for timed challenge
	useEffect(() => {
		if (
			!loading &&
			flashcards.length > 0 &&
			challengeType === "timed" &&
			!timer.isRunning
		) {
			timer.restart(settings.timeLimit);
		}
	}, [loading, flashcards.length, challengeType]);

	// Handle timer expiration
	useEffect(() => {
		if (timer.hasExpired && challengeType === "timed" && !gameEnded) {
			playSound(SOUNDS.SUCCESS);
			setGameEnded(true);
		}
	}, [timer.hasExpired, challengeType, gameEnded]);

	// Handle game over in survival challenge
	useEffect(() => {
		if (lives.isGameOver && challengeType === "survival") {
			playSound(SOUNDS.SUCCESS);
			setGameEnded(true);
		}
	}, [lives.isGameOver, challengeType]);

	// Record session when game ends
	useEffect(() => {
		if (gameEnded && gameStartTime) {
			const endedAt = new Date().toISOString();
			const durationSeconds = Math.round((Date.now() - gameStartTime) / 1000);
			// Match mode: track pairs matched, not correct/wrong (it's a memory game)
			const isMatchMode = gameMode === "match";
			const cardsStudied = isMatchMode
				? flashcards.length // pairs matched
				: scores.correct + scores.incorrect;

			const totalAnswers = scores.correct + scores.incorrect;
			const accuracy =
				totalAnswers > 0
					? Math.round((scores.correct / totalAnswers) * 100)
					: 0;

			// Record session first, then check achievements so streak includes today
			recordSession({
				deckId: parseInt(deckId),
				gameMode,
				challengeType,
				cardsStudied,
				endedAt,
				// Match mode: don't track correct/wrong (memory game, not knowledge test)
				correctAnswers: isMatchMode ? 0 : scores.correct,
				wrongAnswers: isMatchMode ? 0 : scores.incorrect,
				durationSeconds,
			})
				.then(() => {
					// Notify Topbar to refresh streak display
					window.dispatchEvent(new Event("streak-updated"));

					// Now check achievements (session is recorded, streak is up-to-date)
					return checkAchievements({
						accuracy: isMatchMode ? 0 : accuracy,
						cardsStudied,
					});
				})
				.then((result) => {
					if (result?.newlyEarned && result.newlyEarned.length > 0) {
						processNewAchievements(result.newlyEarned);
					}
				})
				.catch((err) =>
					console.error(
						"Error recording session or checking achievements:",
						err,
					),
				);

			// Show ad overlay for free plan users when game ends
			if (hasAds && !adShown) {
				setShowAdOverlay(true);
				// setAdShown(true);
			}
		}
	}, [gameEnded, hasAds, adShown]);

	// Handle answer
	const handleAnswer = useCallback(
		async (isCorrect, playSoundNow = true) => {
			if (gameEnded) return;
			if (answerProcessingRef.current) return;
			answerProcessingRef.current = true;

			setDirection(isCorrect ? 1 : -1);
			if (playSoundNow) playSound(isCorrect ? SOUNDS.CORRECT : SOUNDS.WRONG);

			if (flashcards[currentCardIndex]?.id) {
				try {
					await updateFlashcardStats(
						flashcards[currentCardIndex].id,
						isCorrect,
					);
				} catch (err) {
					console.error("Error updating stats:", err);
				}
			}

			if (isCorrect) {
				setScores((prev) => ({ ...prev, correct: prev.correct + 1 }));
			} else {
				setScores((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
				if (challengeType === "survival") {
					lives.loseLife();
					if (lives.lives <= 1) {
						answerProcessingRef.current = false;
						setGameEnded(true);
						return;
					}
				}
			}

			if (currentCardIndex < flashcards.length - 1) {
				setCurrentCardIndex((prev) => prev + 1);
				setIsCardFlipped(false);
				setWriteResult(null);
				setSelectedChoice(null);
				setShowChoiceResult(false);
			} else {
				if (challengeType === "timed" || challengeType === "survival") {
					setFlashcards((prev) => {
						const shuffled = [...prev];
						for (let i = shuffled.length - 1; i > 0; i--) {
							const j = Math.floor(Math.random() * (i + 1));
							[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
						}
						return shuffled;
					});
					setCurrentCardIndex(0);
					setIsCardFlipped(false);
					setWriteResult(null);
					setSelectedChoice(null);
					setShowChoiceResult(false);
				} else {
					playSound(SOUNDS.SUCCESS);
					setGameEnded(true);
				}
			}

			// Release lock after a short delay to prevent double-tap
			setTimeout(() => {
				answerProcessingRef.current = false;
			}, 250);
		},
		[currentCardIndex, flashcards, challengeType, lives, gameEnded],
	);

	const handleCardFlip = useCallback(() => {
		setIsCardFlipped((prev) => !prev);
	}, []);

	const handleRestart = useCallback(() => {
		answerProcessingRef.current = false;
		setCurrentCardIndex(0);
		setScores({ correct: 0, incorrect: 0 });
		setGameEnded(false);
		setIsCardFlipped(false);
		setDirection(0);
		setWriteResult(null);
		setSelectedChoice(null);
		setShowChoiceResult(false);
		setGameStats({ timeSpent: 0, matchAttempts: 0 });
		setGameStartTime(Date.now());
		lives.reset(settings.lives || 3);
		timer.reset(settings.timeLimit || 10);
		fetchFlashcards();
	}, [fetchFlashcards, lives, timer, settings]);

	const handleStartWithNewSettings = useCallback(
		(newSettings) => {
			answerProcessingRef.current = false;
			setSettings(newSettings);
			setShowSettingsModal(false);
			setCurrentCardIndex(0);
			setScores({ correct: 0, incorrect: 0 });
			setGameEnded(false);
			setIsCardFlipped(false);
			setDirection(0);
			setWriteResult(null);
			setSelectedChoice(null);
			setShowChoiceResult(false);
			setGameStats({ timeSpent: 0, matchAttempts: 0 });
			setGameStartTime(Date.now());
			lives.reset(newSettings.lives || 3);
			timer.reset(newSettings.timeLimit || 10);
		},
		[lives, timer],
	);

	const handleWriteSubmit = async (userAnswer) => {
		const flashcard = flashcards[currentCardIndex];
		try {
			const res = await validateAnswer(flashcard.id, userAnswer, cardDirection);
			setWriteResult(res.data);
			const isWriteAnswerCorrect = Boolean(res.data?.isClose);
			const writeAdvanceDelay = isWriteAnswerCorrect
				? WRITE_CORRECT_DELAY_MS
				: WRITE_WRONG_DELAY_MS;
			// Play feedback immediately, advance UI after a short delay
			playSound(isWriteAnswerCorrect ? SOUNDS.CORRECT : SOUNDS.WRONG);
			setTimeout(() => {
				handleAnswer(isWriteAnswerCorrect, false);
			}, writeAdvanceDelay);
		} catch (err) {
			console.error("Error validating answer:", err);
		}
	};

	const handleChoiceSelect = (index, isCorrect) => {
		setSelectedChoice(index);
		setShowChoiceResult(true);
		setTimeout(() => {
			handleAnswer(isCorrect);
		}, 500);
	};

	const handleMatchComplete = ({ attempts, totalPairs }) => {
		playSound(SOUNDS.SUCCESS);
		setGameStats((prev) => ({
			...prev,
			matchAttempts: attempts,
			matchPairs: totalPairs,
		}));
		setGameEnded(true);
	};

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (gameEnded || loading || flashcards.length === 0) return;

			if (gameMode === "write" && !writeResult) return;

			if (gameMode === "multiple_choice" && !showChoiceResult) {
				if (["1", "2", "3", "4"].includes(e.key)) {
					const index = parseInt(e.key) - 1;
					const options = flashcards[currentCardIndex].options;
					if (options && options[index]) {
						handleChoiceSelect(index, options[index].isCorrect);
					}
					return;
				}
			}

			switch (e.key) {
				case " ":
				case "Enter":
					e.preventDefault();
					if (["standard", "reverse"].includes(gameMode)) {
						handleCardFlip();
					}
					break;
				case "ArrowLeft":
					e.preventDefault();
					if (["standard", "reverse"].includes(gameMode)) {
						handleAnswer(false);
					}
					break;
				case "ArrowRight":
					e.preventDefault();
					if (["standard", "reverse"].includes(gameMode)) {
						handleAnswer(true);
					}
					break;
				default:
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		gameEnded,
		loading,
		flashcards,
		gameMode,
		writeResult,
		showChoiceResult,
		currentCardIndex,
		handleCardFlip,
		handleAnswer,
	]);

	const progress =
		flashcards.length > 0
			? ((currentCardIndex + 1) / flashcards.length) * 100
			: 0;

	const getCurrentCard = () => {
		const card = flashcards[currentCardIndex];
		if (!card) return { front: "", back: "" };

		if (cardDirection === "reverse") {
			return { front: card.back_text, back: card.front_text };
		}
		return { front: card.front_text, back: card.back_text };
	};

	// Loading state
	if (loading) {
		return (
			<PageContainer centered>
				<MotionBox
					initial={{ scale: 0.95 }}
					animate={{ scale: 1 }}
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 3,
					}}
				>
					<Box
						sx={{
							width: 80,
							height: 80,
							borderRadius: "20px",
							background:
								"linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<MotionBox
							animate={{ rotate: 360 }}
							transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
						>
							<StyleIcon sx={{ fontSize: 40, color: "primary.light" }} />
						</MotionBox>
					</Box>
					<Typography
						variant="h6"
						sx={{ color: "text.cardSubtitle", fontFamily: "Inter, sans-serif" }}
					>
						{t("loading_cards") || "Loading flashcards..."}
					</Typography>
				</MotionBox>
			</PageContainer>
		);
	}

	// Empty state
	if (flashcards.length === 0) {
		return (
			<PageContainer centered>
				<EmptyState
					icon={StyleIcon}
					title={
						hardModeEnabled
							? t("no_hard_cards") || "No hard cards found"
							: t("no_flashcards") || "No flashcards found"
					}
					description={
						hardModeEnabled
							? t("no_hard_cards_desc") ||
								"Great job! You have no cards marked as difficult."
							: t("no_flashcards_desc") ||
								"This deck has no flashcards yet. Add some cards to start studying."
					}
					actionLabel={t("back_to_decks") || "Back to Decks"}
					onAction={onBackToDecks}
				/>
				{/* Limit Warning Modal */}
				<LimitWarningModal
					open={limitWarningOpen}
					onClose={() => {
						setLimitWarningOpen(false);
						onBackToDecks();
					}}
					currentDecks={currentDecks}
					maxDecks={maxDecks}
					deckOverage={deckOverage}
					currentFlashcards={currentFlashcards}
					maxFlashcards={maxFlashcards}
					flashcardOverage={flashcardOverage}
					planCode={planCode}
				/>
			</PageContainer>
		);
	}

	// Game ended - show summary (with ad overlay for free plan)
	if (gameEnded) {
		return (
			<PageContainer centered>
				{/* Video Ad Overlay for free plan users */}
				<VideoAdOverlay
					open={showAdOverlay}
					onClose={() => setShowAdOverlay(false)}
				/>
				<GameSummary
					correctCount={scores.correct}
					incorrectCount={scores.incorrect}
					onRestart={handleRestart}
					onBackToDecks={onBackToDecks}
					onChangeMode={() => setShowSettingsModal(true)}
					gameMode={gameMode}
					challengeType={challengeType}
					livesRemaining={lives.lives}
					maxLives={lives.maxLives}
					matchAttempts={gameStats.matchAttempts}
					matchPairs={gameStats.matchPairs || Math.min(flashcards.length, 6)}
				/>
				<GameSettingsModal
					open={showSettingsModal}
					onClose={() => setShowSettingsModal(false)}
					deckId={deckId}
					onStart={handleStartWithNewSettings}
				/>
			</PageContainer>
		);
	}

	// Match mode
	if (gameMode === "match") {
		return (
			<MatchView
				flashcards={flashcards}
				onBackToDecks={onBackToDecks}
				onRestart={handleRestart}
				onMatchComplete={handleMatchComplete}
				onMatch={(isCorrect) => {
					if (isCorrect) playSound(SOUNDS.CORRECT);
				}}
				onCardClick={() => playSound(SOUNDS.FLIP)}
				challengeType={challengeType}
				timer={timer}
				t={t}
			/>
		);
	}

	const currentCard = getCurrentCard();

	return (
		<PageContainer
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 4,
				py: 4,
			}}
		>
			{/* Progress Section */}
			<MotionBox
				initial={{ y: -20 }}
				animate={{ y: 0 }}
				sx={{ width: "100%", maxWidth: 500 }}
			>
				<GameHeader
					gameMode={gameMode}
					challengeType={challengeType}
					currentCardIndex={currentCardIndex}
					flashcardsLength={flashcards.length}
					timer={timer}
					lives={lives}
					settings={settings}
					onBackToDecks={onBackToDecks}
					onRestart={handleRestart}
					t={t}
				/>

				<GameProgress
					scores={scores}
					progress={progress}
					gameMode={gameMode}
					challengeType={challengeType}
					t={t}
				/>
			</MotionBox>

			{/* Card Area */}
			<Box
				sx={{
					position: "relative",
					width: "100%",
					maxWidth: gameMode === "multiple_choice" ? 600 : 500,
					minHeight: 300,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 3,
				}}
			>
				{/* Standard mode */}
				{["standard", "reverse"].includes(gameMode) && (
					<CardView
						currentCardIndex={currentCardIndex}
						currentCard={currentCard}
						isCardFlipped={isCardFlipped}
						onCardFlip={handleCardFlip}
						direction={direction}
					/>
				)}

				{/* Write Mode */}
				{gameMode === "write" && (
					<WriteView
						currentCardIndex={currentCardIndex}
						currentCard={currentCard}
						writeResult={writeResult}
						onWriteSubmit={handleWriteSubmit}
					/>
				)}

				{/* Multiple Choice Mode */}
				{gameMode === "multiple_choice" && (
					<MultipleChoiceView
						currentCardIndex={currentCardIndex}
						flashcard={flashcards[currentCardIndex]}
						questionText={
							cardDirection === "reverse"
								? flashcards[currentCardIndex]?.back_text
								: flashcards[currentCardIndex]?.front_text
						}
						selectedChoice={selectedChoice}
						showChoiceResult={showChoiceResult}
						onChoiceSelect={handleChoiceSelect}
					/>
				)}
			</Box>

			{/* Answer Buttons */}
			{["standard", "reverse"].includes(gameMode) && (
				<AnswerButtons onAnswer={handleAnswer} t={t} />
			)}

			{/* Keyboard Hints */}
			{["standard", "reverse"].includes(gameMode) && (
				<MotionBox
					initial={{ y: 10 }}
					animate={{ y: 0 }}
					transition={{ delay: 0.4 }}
					sx={{
						display: { xs: "none", md: "flex" },
						gap: 4,
						mt: 2,
					}}
				>
					<KeyboardHint
						icon={KeyboardArrowLeftIcon}
						label={t("incorrect") || "Incorrect"}
					/>
					<KeyboardHint icon={SpaceBarIcon} label={t("flip_card") || "Flip"} />
					<KeyboardHint
						icon={KeyboardArrowRightIcon}
						label={t("correct") || "Correct"}
					/>
				</MotionBox>
			)}
		</PageContainer>
	);
}
