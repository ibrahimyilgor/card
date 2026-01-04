import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	getGameFlashcards,
	getHardFlashcards,
	getFlashcardsWithOptions,
	validateAnswer,
	updateFlashcardStats,
} from "../services/gameServices";
import { recordSession } from "../services/statsServices";
import {
	Box,
	Typography,
	LinearProgress,
	Tooltip,
	alpha,
	useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SpaceBarIcon from "@mui/icons-material/SpaceBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import TimerIcon from "@mui/icons-material/Timer";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FlashCard from "../components/FlashCard";
import GameSummary from "../components/GameSummary";
import {
	TimerDisplay,
	LivesDisplay,
	WriteInput,
	MultipleChoice,
	MatchGrid,
} from "../components/game";
import { useGameTimer, useGameLives } from "../hooks";
import { I18nContext } from "../utils/i18n";
import { PageContainer, StyledButton, EmptyState } from "../components/ui";
import StyleIcon from "@mui/icons-material/Style";
import { playSound, SOUNDS } from "../utils/sounds";

const MotionBox = motion.create(Box);

// Keyboard hint component
const KeyboardHint = ({ icon: Icon, label }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 0.75,
			color: "text.cardSubtitle",
			fontSize: "0.75rem",
			fontFamily: "Inter, sans-serif",
		}}
	>
		<Box
			sx={{
				width: 28,
				height: 28,
				borderRadius: "8px",
				bgcolor: (theme) =>
					theme.palette.mode === "dark"
						? "rgba(255, 255, 255, 0.08)"
						: "rgba(0, 0, 0, 0.06)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				border: (theme) =>
					`1px solid ${
						theme.palette.mode === "dark"
							? "rgba(255, 255, 255, 0.1)"
							: "rgba(0, 0, 0, 0.1)"
					}`,
			}}
		>
			<Icon sx={{ fontSize: 16 }} />
		</Box>
		<Typography variant="caption" sx={{ color: "inherit" }}>
			{label}
		</Typography>
	</Box>
);

export default function Game({ onBackToDecks }) {
	const { deckId } = useParams();
	const location = useLocation();
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	// Get settings from navigation state
	const settings = location.state?.settings || {
		mode: "standard",
		timeLimit: 10,
		lives: 3,
	};
	const gameMode = settings.mode || "standard";

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

	const fetchFlashcards = useCallback(async () => {
		setLoading(true);
		try {
			let res;

			// Choose endpoint based on game mode
			if (gameMode === "hard_cards") {
				res = await getHardFlashcards(deckId);
			} else if (gameMode === "multiple_choice") {
				res = await getFlashcardsWithOptions(deckId);
			} else {
				res = await getGameFlashcards(deckId);
			}

			if (res.data && Array.isArray(res.data.flashcards)) {
				let cards = [...res.data.flashcards];

				// Don't shuffle for match mode (it handles its own shuffling)
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
	}, [deckId, gameMode]);

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
		if (!loading && flashcards.length > 0 && gameMode === "timed") {
			timer.restart(settings.timeLimit);
		}
	}, [loading, flashcards.length, gameMode, currentCardIndex]);

	// Handle timer expiration
	useEffect(() => {
		if (timer.hasExpired && gameMode === "timed") {
			handleAnswer(false);
		}
	}, [timer.hasExpired]);

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

			recordSession({
				deckId: parseInt(deckId),
				gameMode,
				cardsStudied,
				correctAnswers: scores.correct,
				wrongAnswers: scores.incorrect,
				durationSeconds,
			}).catch((err) => console.error("Error recording session:", err));
		}
	}, [gameEnded]);

	const handleAnswer = useCallback(
		async (isCorrect) => {
			setDirection(isCorrect ? 1 : -1);

			// Play sound effect
			playSound(isCorrect ? SOUNDS.CORRECT : SOUNDS.WRONG);

			// Update stats in database
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
				// Lose a life in survival mode
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

				// Reset timer for timed mode
				if (gameMode === "timed") {
					timer.restart(settings.timeLimit);
				}
			} else {
				// Game completed - play success sound
				playSound(SOUNDS.SUCCESS);
				setGameEnded(true);
			}
		},
		[currentCardIndex, flashcards, gameMode, lives, timer, settings.timeLimit]
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

	// Handle write mode submission
	const handleWriteSubmit = async (userAnswer) => {
		const flashcard = flashcards[currentCardIndex];
		try {
			const res = await validateAnswer(flashcard.id, userAnswer);
			setWriteResult(res.data);

			// Auto-advance after showing result
			setTimeout(() => {
				handleAnswer(res.data.correct);
			}, 2000);
		} catch (err) {
			console.error("Error validating answer:", err);
		}
	};

	// Handle multiple choice selection
	const handleChoiceSelect = (index, isCorrect) => {
		setSelectedChoice(index);
		setShowChoiceResult(true);

		// Auto-advance after showing result
		setTimeout(() => {
			handleAnswer(isCorrect);
		}, 1500);
	};

	// Handle match mode completion
	const handleMatchComplete = ({ attempts }) => {
		playSound(SOUNDS.SUCCESS);
		setGameStats((prev) => ({ ...prev, matchAttempts: attempts }));
		setGameEnded(true);
	};

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (gameEnded || loading || flashcards.length === 0) return;

			// Don't handle keys if in write mode and not showing result
			if (gameMode === "write" && !writeResult) return;

			// Handle number keys for multiple choice
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

	// Get current card with reverse mode handling
	const getCurrentCard = () => {
		const card = flashcards[currentCardIndex];
		if (!card) return { front: "", back: "" };

		if (gameMode === "reverse") {
			return { front: card.back_text, back: card.front_text };
		}
		return { front: card.front_text, back: card.back_text };
	};

	// Loading state
	if (loading) {
		return (
			<PageContainer centered>
				<MotionBox
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
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

	if (flashcards.length === 0) {
		return (
			<PageContainer centered>
				<EmptyState
					icon={StyleIcon}
					title={
						gameMode === "hard_cards"
							? t("no_hard_cards") || "No hard cards found"
							: t("no_flashcards") || "No flashcards found"
					}
					description={
						gameMode === "hard_cards"
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

	if (gameEnded) {
		return (
			<PageContainer centered>
				<GameSummary
					correctCount={scores.correct}
					incorrectCount={scores.incorrect}
					onRestart={handleRestart}
					onBackToDecks={onBackToDecks}
					gameMode={gameMode}
					livesRemaining={lives.lives}
					maxLives={lives.maxLives}
					matchAttempts={gameStats.matchAttempts}
				/>
			</PageContainer>
		);
	}

	// Match mode has its own UI
	if (gameMode === "match") {
		return (
			<PageContainer
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					py: 4,
				}}
			>
				<MotionBox
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					sx={{ width: "100%", maxWidth: 800, mb: 4 }}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<StyledButton
							variant="ghost"
							startIcon={<ArrowBackIcon />}
							onClick={onBackToDecks}
						>
							{t("exit") || "Exit"}
						</StyledButton>
						<Typography
							variant="h5"
							sx={{
								color: "text.cardTitle",
								fontWeight: 700,
								fontFamily: "Inter, sans-serif",
							}}
						>
							{t("mode_match") || "Match Mode"}
						</Typography>
						<StyledButton
							variant="ghost"
							startIcon={<RefreshIcon />}
							onClick={handleRestart}
						>
							{t("restart") || "Restart"}
						</StyledButton>
					</Box>
				</MotionBox>

				<MatchGrid
					flashcards={flashcards}
					onComplete={handleMatchComplete}
					onMatch={(isCorrect) => {
						// Play sound effect
						playSound(isCorrect ? SOUNDS.CORRECT : SOUNDS.WRONG);
						if (isCorrect) {
							setScores((prev) => ({ ...prev, correct: prev.correct + 1 }));
						}
					}}
				/>
			</PageContainer>
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
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				sx={{ width: "100%", maxWidth: 500 }}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 1.5,
					}}
				>
					<Tooltip title={t("back_to_decks") || "Back to decks"}>
						<StyledButton
							variant="ghost"
							size="small"
							startIcon={<ArrowBackIcon />}
							onClick={onBackToDecks}
						>
							{t("exit") || "Exit"}
						</StyledButton>
					</Tooltip>

					{/* Mode-specific indicators */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						{gameMode === "timed" && (
							<TimerDisplay
								timeLeft={timer.timeLeft}
								totalTime={settings.timeLimit}
							/>
						)}
						{gameMode === "survival" && (
							<LivesDisplay lives={lives.lives} maxLives={lives.maxLives} />
						)}
						<Typography
							variant="body1"
							sx={{
								color: "text.cardTitle",
								fontWeight: 600,
								fontFamily: "Inter, sans-serif",
							}}
						>
							{currentCardIndex + 1} / {flashcards.length}
						</Typography>
					</Box>

					<Tooltip title={t("restart_game") || "Restart"}>
						<StyledButton
							variant="ghost"
							size="small"
							startIcon={<RefreshIcon />}
							onClick={handleRestart}
						>
							{t("restart") || "Restart"}
						</StyledButton>
					</Tooltip>
				</Box>

				<LinearProgress
					variant="determinate"
					value={progress}
					sx={{
						height: 8,
						borderRadius: 4,
						bgcolor: (theme) =>
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.08)",
						"& .MuiLinearProgress-bar": {
							borderRadius: 4,
							background:
								gameMode === "timed"
									? "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)"
									: gameMode === "survival"
									? "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"
									: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
						},
					}}
				/>

				{/* Score indicators */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						gap: 4,
						mt: 2,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Box
							sx={{
								width: 12,
								height: 12,
								borderRadius: "50%",
								bgcolor: "success.main",
							}}
						/>
						<Typography
							variant="body2"
							sx={{
								color: "text.cardSubtitle",
								fontFamily: "Inter, sans-serif",
							}}
						>
							{scores.correct} {t("correct") || "correct"}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Box
							sx={{
								width: 12,
								height: 12,
								borderRadius: "50%",
								bgcolor: "error.main",
							}}
						/>
						<Typography
							variant="body2"
							sx={{
								color: "text.cardSubtitle",
								fontFamily: "Inter, sans-serif",
							}}
						>
							{scores.incorrect} {t("incorrect_label") || "incorrect"}
						</Typography>
					</Box>
				</Box>
			</MotionBox>

			{/* Card Area - Different for each mode */}
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
				{/* Standard, Timed, Survival, Reverse modes - Show FlashCard */}
				{["standard", "timed", "survival", "reverse"].includes(gameMode) && (
					<AnimatePresence mode="wait" initial={false}>
						<MotionBox
							key={currentCardIndex}
							initial={{
								opacity: 0,
								x: direction * 100,
								scale: 0.95,
							}}
							animate={{
								opacity: 1,
								x: 0,
								scale: 1,
							}}
							exit={{
								opacity: 0,
								x: direction * -100,
								scale: 0.95,
							}}
							transition={{
								duration: 0.3,
								ease: "easeOut",
							}}
						>
							<FlashCard
								front={currentCard.front}
								back={currentCard.back}
								isFlipped={isCardFlipped}
								onFlip={handleCardFlip}
							/>
						</MotionBox>
					</AnimatePresence>
				)}

				{/* Write Mode */}
				{gameMode === "write" && (
					<AnimatePresence mode="wait" initial={false}>
						<MotionBox
							key={currentCardIndex}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 3,
								width: "100%",
							}}
						>
							{/* Question */}
							<Box
								sx={{
									p: 4,
									borderRadius: 4,
									background: (theme) =>
										theme.palette.mode === "dark"
											? "linear-gradient(145deg, #1a1f2e 0%, #111827 100%)"
											: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
									border: (theme) =>
										`1px solid ${
											theme.palette.mode === "dark"
												? "rgba(255, 255, 255, 0.08)"
												: "rgba(0, 0, 0, 0.08)"
										}`,
									textAlign: "center",
									width: "100%",
									maxWidth: 500,
								}}
							>
								<Typography
									variant="h5"
									sx={{
										color: "text.cardTitle",
										fontWeight: 600,
										fontFamily: "Inter, sans-serif",
									}}
								>
									{currentCard.front}
								</Typography>
							</Box>

							{/* Write Input */}
							<WriteInput
								onSubmit={handleWriteSubmit}
								correctAnswer={currentCard.back}
								showResult={!!writeResult}
								isCorrect={writeResult?.correct}
								isClose={writeResult?.isClose}
								disabled={!!writeResult}
							/>
						</MotionBox>
					</AnimatePresence>
				)}

				{/* Multiple Choice Mode */}
				{gameMode === "multiple_choice" && (
					<AnimatePresence mode="wait" initial={false}>
						<MotionBox
							key={currentCardIndex}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 3,
								width: "100%",
							}}
						>
							{/* Question */}
							<Box
								sx={{
									p: 4,
									borderRadius: 4,
									background: (theme) =>
										theme.palette.mode === "dark"
											? "linear-gradient(145deg, #1a1f2e 0%, #111827 100%)"
											: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
									border: (theme) =>
										`1px solid ${
											theme.palette.mode === "dark"
												? "rgba(255, 255, 255, 0.08)"
												: "rgba(0, 0, 0, 0.08)"
										}`,
									textAlign: "center",
									width: "100%",
								}}
							>
								<Typography
									variant="h5"
									sx={{
										color: "text.cardTitle",
										fontWeight: 600,
										fontFamily: "Inter, sans-serif",
									}}
								>
									{flashcards[currentCardIndex]?.front_text}
								</Typography>
							</Box>

							{/* Options */}
							<MultipleChoice
								options={flashcards[currentCardIndex]?.options || []}
								onSelect={handleChoiceSelect}
								disabled={showChoiceResult}
								showResult={showChoiceResult}
								selectedIndex={selectedChoice}
							/>
						</MotionBox>
					</AnimatePresence>
				)}
			</Box>

			{/* Answer Buttons - Only for standard, timed, survival, reverse modes */}
			{["standard", "timed", "survival", "reverse"].includes(gameMode) && (
				<MotionBox
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					sx={{
						display: "flex",
						gap: 3,
					}}
				>
					<StyledButton
						variant="danger"
						size="large"
						startIcon={<CloseIcon />}
						onClick={() => handleAnswer(false)}
						sx={{ minWidth: 140 }}
					>
						{t("incorrect") || "Incorrect"}
					</StyledButton>
					<StyledButton
						variant="success"
						size="large"
						startIcon={<CheckIcon />}
						onClick={() => handleAnswer(true)}
						sx={{ minWidth: 140 }}
					>
						{t("correct") || "Correct"}
					</StyledButton>
				</MotionBox>
			)}

			{/* Keyboard Hints */}
			{["standard", "timed", "survival", "reverse"].includes(gameMode) && (
				<MotionBox
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
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
