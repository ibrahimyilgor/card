import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
import { PageContainer, EmptyState } from "../components/ui";
import { playSound, SOUNDS } from "../utils/sounds";

const MotionBox = motion.create(Box);

export default function Game({ onBackToDecks }) {
	const { deckId } = useParams();
	const location = useLocation();
	const { t } = useContext(I18nContext);
	const { processNewAchievements } = useContext(AchievementContext);

	// Get initial settings from navigation state, then manage locally
	const initialSettings = location.state?.settings || {
		mode: "standard",
		timeLimit: 60,
		lives: 3,
		cardDirection: "normal",
		hardModeEnabled: false,
	};
	const [settings, setSettings] = useState(initialSettings);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const gameMode = settings.mode || "standard";
	const cardDirection = settings.cardDirection || "normal";
	const hardModeEnabled = settings.hardModeEnabled || false;

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

	// Custom hooks for timed and survival modes
	const timer = useGameTimer(settings.timeLimit || 10, gameMode === "timed");
	const lives = useGameLives(settings.lives || 3);

	// Fetch flashcards
	const fetchFlashcards = useCallback(async () => {
		setLoading(true);
		try {
			let res;

			if (hardModeEnabled) {
				res = await getHardFlashcards(deckId);
			} else if (gameMode === "multiple_choice") {
				res = await getFlashcardsWithOptions(deckId);
			} else {
				res = await getGameFlashcards(deckId);
			}

			if (res.data && Array.isArray(res.data.flashcards)) {
				let cards = [...res.data.flashcards];

				if (gameMode !== "match") {
					cards = cards.sort(() => Math.random() - 0.5);
				}

				setFlashcards(cards);
			} else {
				setFlashcards([]);
			}
		} catch (err) {
			console.error("Error fetching flashcards:", err);
			setFlashcards([]);
		} finally {
			setLoading(false);
		}
	}, [deckId, gameMode, hardModeEnabled]);

	useEffect(() => {
		fetchFlashcards();
	}, [fetchFlashcards]);

	// Set game start time when cards load
	useEffect(() => {
		if (!loading && flashcards.length > 0 && !gameStartTime) {
			setGameStartTime(Date.now());
		}
	}, [loading, flashcards.length, gameStartTime]);

	// Start timer when cards load for timed mode
	useEffect(() => {
		if (
			!loading &&
			flashcards.length > 0 &&
			gameMode === "timed" &&
			!timer.isRunning
		) {
			timer.restart(settings.timeLimit);
		}
	}, [loading, flashcards.length, gameMode]);

	// Handle timer expiration
	useEffect(() => {
		if (timer.hasExpired && gameMode === "timed" && !gameEnded) {
			playSound(SOUNDS.GAME_OVER);
			setGameEnded(true);
		}
	}, [timer.hasExpired, gameMode, gameEnded]);

	// Handle game over in survival mode
	useEffect(() => {
		if (lives.isGameOver && gameMode === "survival") {
			playSound(SOUNDS.GAME_OVER);
			setGameEnded(true);
		}
	}, [lives.isGameOver, gameMode]);

	// Record session when game ends
	useEffect(() => {
		if (gameEnded && gameStartTime) {
			const durationSeconds = Math.round((Date.now() - gameStartTime) / 1000);
			const cardsStudied =
				gameMode === "match"
					? flashcards.length
					: scores.correct + scores.incorrect;

			const totalAnswers = scores.correct + scores.incorrect;
			const accuracy =
				totalAnswers > 0
					? Math.round((scores.correct / totalAnswers) * 100)
					: 0;

			recordSession({
				deckId: parseInt(deckId),
				gameMode,
				cardsStudied,
				correctAnswers: scores.correct,
				wrongAnswers: scores.incorrect,
				durationSeconds,
			}).catch((err) => console.error("Error recording session:", err));

			checkAchievements({
				accuracy,
				cardsStudied,
			})
				.then((result) => {
					if (result.newlyEarned && result.newlyEarned.length > 0) {
						processNewAchievements(result.newlyEarned);
					}
				})
				.catch((err) => console.error("Error checking achievements:", err));
		}
	}, [gameEnded]);

	// Handle answer
	const handleAnswer = useCallback(
		async (isCorrect) => {
			if (gameEnded) return;

			setDirection(isCorrect ? 1 : -1);
			playSound(isCorrect ? SOUNDS.CORRECT : SOUNDS.WRONG);

			if (flashcards[currentCardIndex]?.id) {
				try {
					await updateFlashcardStats(
						flashcards[currentCardIndex].id,
						isCorrect
					);
				} catch (err) {
					console.error("Error updating stats:", err);
				}
			}

			if (isCorrect) {
				setScores((prev) => ({ ...prev, correct: prev.correct + 1 }));
			} else {
				setScores((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
				if (gameMode === "survival") {
					lives.loseLife();
					if (lives.lives <= 1) {
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
				if (gameMode === "timed" || gameMode === "survival") {
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
		},
		[currentCardIndex, flashcards, gameMode, lives, gameEnded]
	);

	const handleCardFlip = useCallback(() => {
		setIsCardFlipped((prev) => !prev);
	}, []);

	const handleRestart = useCallback(() => {
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
		[lives, timer]
	);

	const handleWriteSubmit = async (userAnswer) => {
		const flashcard = flashcards[currentCardIndex];
		try {
			const res = await validateAnswer(flashcard.id, userAnswer);
			setWriteResult(res.data);
			setTimeout(() => {
				handleAnswer(res.data.correct);
			}, 2000);
		} catch (err) {
			console.error("Error validating answer:", err);
		}
	};

	const handleChoiceSelect = (index, isCorrect) => {
		setSelectedChoice(index);
		setShowChoiceResult(true);
		setTimeout(() => {
			handleAnswer(isCorrect);
		}, 1500);
	};

	const handleMatchComplete = ({ attempts }) => {
		playSound(SOUNDS.SUCCESS);
		setGameStats((prev) => ({ ...prev, matchAttempts: attempts }));
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
					if (["standard", "timed", "survival", "reverse"].includes(gameMode)) {
						handleCardFlip();
					}
					break;
				case "ArrowLeft":
					e.preventDefault();
					if (["standard", "timed", "survival", "reverse"].includes(gameMode)) {
						handleAnswer(false);
					}
					break;
				case "ArrowRight":
					e.preventDefault();
					if (["standard", "timed", "survival", "reverse"].includes(gameMode)) {
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
			</PageContainer>
		);
	}

	// Game ended - show summary
	if (gameEnded) {
		return (
			<PageContainer centered>
				<GameSummary
					correctCount={scores.correct}
					incorrectCount={scores.incorrect}
					onRestart={handleRestart}
					onBackToDecks={onBackToDecks}
					onChangeMode={() => setShowSettingsModal(true)}
					gameMode={gameMode}
					livesRemaining={lives.lives}
					maxLives={lives.maxLives}
					matchAttempts={gameStats.matchAttempts}
					matchPairs={Math.min(flashcards.length, 6)}
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
					playSound(isCorrect ? SOUNDS.CORRECT : SOUNDS.WRONG);
				}}
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
				{/* Standard, Timed, Survival, Reverse modes */}
				{["standard", "timed", "survival", "reverse"].includes(gameMode) && (
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
						selectedChoice={selectedChoice}
						showChoiceResult={showChoiceResult}
						onChoiceSelect={handleChoiceSelect}
					/>
				)}
			</Box>

			{/* Answer Buttons */}
			{["standard", "timed", "survival", "reverse"].includes(gameMode) && (
				<AnswerButtons onAnswer={handleAnswer} t={t} />
			)}

			{/* Keyboard Hints */}
			{["standard", "timed", "survival", "reverse"].includes(gameMode) && (
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
