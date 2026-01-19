import React, { useContext } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import ReplayIcon from "@mui/icons-material/Replay";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import StyleIcon from "@mui/icons-material/Style";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GridViewIcon from "@mui/icons-material/GridView";
import { I18nContext } from "../utils/i18n";
import { StyledCard, StyledButton } from "./ui";

const MotionBox = motion.create(Box);

// Stat Card Component
function StatItem({ value, label, color, icon: Icon, delay = 0 }) {
	const theme = useTheme();

	return (
		<MotionBox
			initial={{ y: 20 }}
			animate={{ y: 0 }}
			transition={{ delay, duration: 0.4 }}
			sx={{
				textAlign: "center",
				p: { xs: 1, sm: 1.5, md: 2 },
				borderRadius: { xs: 2, sm: 3 },
				background: alpha(color, 0.08),
				border: `1px solid ${alpha(color, 0.2)}`,
				minWidth: { xs: 60, sm: 80, md: 90 },
				flex: "1 1 0",
			}}
		>
			<Box
				sx={{
					width: { xs: 28, sm: 36, md: 40 },
					height: { xs: 28, sm: 36, md: 40 },
					borderRadius: { xs: "8px", sm: "10px" },
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: alpha(color, 0.15),
					mx: "auto",
					mb: { xs: 0.5, sm: 1 },
				}}
			>
				<Icon sx={{ fontSize: { xs: 16, sm: 20, md: 22 }, color }} />
			</Box>
			<Typography
				variant="h5"
				sx={{
					fontWeight: 700,
					color,
					fontFamily: "Inter, sans-serif",
					mb: 0.25,
					fontSize: { xs: "0.95rem", sm: "1.2rem", md: "1.5rem" },
				}}
			>
				{value}
			</Typography>
			<Typography
				variant="caption"
				sx={{
					color: "text.cardSubtitle",
					fontFamily: "Inter, sans-serif",
					fontWeight: 500,
					fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.75rem" },
				}}
			>
				{label}
			</Typography>
		</MotionBox>
	);
}

export default function GameSummary({
	correctCount,
	incorrectCount,
	onRestart,
	onBackToDecks,
	onChangeMode,
	gameMode = "standard",
	challengeType = "none",
	livesRemaining = 0,
	maxLives = 3,
	matchAttempts = 0,
	matchPairs = 0,
}) {
	const theme = useTheme();
	const totalCards = correctCount + incorrectCount;
	// Match mode: accuracy = pairs / attempts (perfect = 100%)
	// Other modes: accuracy = correct / total
	const percentage =
		gameMode === "match"
			? matchAttempts > 0
				? Math.round((matchPairs / matchAttempts) * 100)
				: 0
			: totalCards > 0
				? Math.round((correctCount / totalCards) * 100)
				: 0;
	const { t } = useContext(I18nContext);

	// Determine grade and message based on percentage and mode
	const getGrade = () => {
		// Survival challenge - game over
		if (challengeType === "survival" && livesRemaining === 0) {
			return {
				grade: "💀",
				message: t("game_over") || "Game Over!",
				color: "#ef4444",
			};
		}

		if (percentage >= 90)
			return {
				grade: "A+",
				message: t("outstanding") || "Outstanding!",
				color: "#22c55e",
			};
		if (percentage >= 80)
			return {
				grade: "A",
				message: t("excellent") || "Excellent!",
				color: "#22c55e",
			};
		if (percentage >= 70)
			return {
				grade: "B",
				message: t("good_job") || "Good job!",
				color: "#3b82f6",
			};
		if (percentage >= 60)
			return {
				grade: "C",
				message: t("keep_practicing") || "Keep practicing!",
				color: "#f59e0b",
			};
		return {
			grade: "D",
			message: t("need_more_practice") || "Need more practice",
			color: "#ef4444",
		};
	};

	const { grade, message, color: gradeColor } = getGrade();

	return (
		<MotionBox
			initial={{ scale: 0.95 }}
			animate={{ scale: 1 }}
			transition={{ duration: 0.5 }}
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 3,
				p: 3,
				maxWidth: 600,
				mx: "auto",
			}}
		>
			{/* Trophy Icon */}
			<MotionBox
				initial={{ scale: 0, rotate: -180 }}
				animate={{ scale: 1, rotate: 0 }}
				transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
			>
				<Box
					sx={{
						width: 80,
						height: 80,
						borderRadius: "20px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: `linear-gradient(135deg, ${alpha(
							gradeColor,
							0.2,
						)} 0%, ${alpha(gradeColor, 0.05)} 100%)`,
						border: `2px solid ${alpha(gradeColor, 0.3)}`,
						boxShadow: `0 8px 32px ${alpha(gradeColor, 0.2)}`,
					}}
				>
					<EmojiEventsIcon sx={{ fontSize: 44, color: gradeColor }} />
				</Box>
			</MotionBox>

			<StyledCard
				variant="elevated"
				sx={{
					width: "100%",
					p: 4,
					textAlign: "center",
				}}
			>
				{/* Title */}
				<MotionBox
					initial={{ y: -10 }}
					animate={{ y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Typography
						variant="h5"
						sx={{
							fontWeight: 700,
							color: "text.cardTitle",
							fontFamily: "Inter, sans-serif",
							mb: 1,
						}}
					>
						{t("game_summary") || "Game Complete!"}
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: gradeColor,
							fontFamily: "Inter, sans-serif",
							fontWeight: 600,
							mb: 3,
						}}
					>
						{message}
					</Typography>
				</MotionBox>

				{/* Percentage Circle - Hide for match mode */}
				{gameMode !== "match" && (
					<MotionBox
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
						sx={{ mb: 4 }}
					>
						<Box
							sx={{
								position: "relative",
								width: 140,
								height: 140,
								mx: "auto",
							}}
						>
							{/* Background circle */}
							<Box
								sx={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									borderRadius: "50%",
									border: `8px solid ${alpha(theme.palette.divider, 0.2)}`,
								}}
							/>
							{/* Progress circle */}
							<Box
								component="svg"
								viewBox="0 0 100 100"
								sx={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									transform: "rotate(-90deg)",
								}}
							>
								<motion.circle
									cx="50"
									cy="50"
									r="42"
									fill="none"
									stroke={gradeColor}
									strokeWidth="8"
									strokeLinecap="round"
									initial={{ pathLength: 0 }}
									animate={{ pathLength: percentage / 100 }}
									transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
									style={{
										strokeDasharray: "264",
										strokeDashoffset: "0",
									}}
								/>
							</Box>
							{/* Content */}
							<Box
								sx={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									textAlign: "center",
								}}
							>
								<Typography
									variant="h3"
									sx={{
										fontWeight: 800,
										color: gradeColor,
										fontFamily: "Inter, sans-serif",
										lineHeight: 1,
										fontSize: 36,
									}}
								>
									{percentage}%
								</Typography>
								<Typography
									variant="caption"
									sx={{
										color: "text.cardSubtitle",
										fontFamily: "Inter, sans-serif",
										fontWeight: 500,
									}}
								>
									{t("success_rate") || "Score"}
								</Typography>
							</Box>
						</Box>
					</MotionBox>
				)}

				{/* Stats Row */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						gap: { xs: 1, sm: 2 },
						flexWrap: "nowrap",
						width: "100%",
						"&::-webkit-scrollbar": { display: "none" },
						scrollbarWidth: "none",
					}}
				>
					{/* Match mode: show pairs and attempts only */}
					{gameMode === "match" ? (
						<>
							<StatItem
								value={matchPairs}
								label={t("pairs") || "Pairs"}
								color={theme.palette.primary.main}
								icon={StyleIcon}
								delay={0.6}
							/>
							<StatItem
								value={matchAttempts}
								label={t("attempts") || "Attempts"}
								color="#ec4899"
								icon={GridViewIcon}
								delay={0.7}
							/>
						</>
					) : (
						<>
							<StatItem
								value={correctCount}
								label={t("correct") || "Correct"}
								color={theme.palette.success.main}
								icon={CheckCircleIcon}
								delay={0.6}
							/>
							<StatItem
								value={incorrectCount}
								label={t("incorrect") || "Incorrect"}
								color={theme.palette.error.main}
								icon={CancelIcon}
								delay={0.7}
							/>
							<StatItem
								value={totalCards}
								label={t("total") || "Total"}
								color={theme.palette.primary.main}
								icon={StyleIcon}
								delay={0.8}
							/>
						</>
					)}
				</Box>
			</StyledCard>

			{/* Action Buttons */}
			<MotionBox
				initial={{ y: 20 }}
				animate={{ y: 0 }}
				transition={{ delay: 0.9, duration: 0.4 }}
				sx={{
					display: "flex",
					gap: 2,
					flexWrap: "wrap",
					justifyContent: "center",
				}}
			>
				<StyledButton
					variant="secondary"
					onClick={onBackToDecks}
					startIcon={<HomeIcon />}
				>
					{t("back_to_decks") || "Back to Decks"}
				</StyledButton>
				{onChangeMode && (
					<StyledButton
						variant="secondary"
						onClick={onChangeMode}
						startIcon={<SettingsIcon />}
					>
						{t("change_mode") || "Change Mode"}
					</StyledButton>
				)}
				<StyledButton
					variant="primary"
					onClick={onRestart}
					startIcon={<ReplayIcon />}
				>
					{t("play_again") || "Play Again"}
				</StyledButton>
			</MotionBox>
		</MotionBox>
	);
}
