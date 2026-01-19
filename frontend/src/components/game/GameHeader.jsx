import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import { StyledButton } from "../ui";
import TimerDisplay from "./TimerDisplay";
import LivesDisplay from "./LivesDisplay";

const GameHeader = ({
	gameMode,
	challengeType,
	currentCardIndex,
	flashcardsLength,
	timer,
	lives,
	settings,
	onBackToDecks,
	onRestart,
	t,
}) => {
	return (
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

			{/* Challenge-specific indicators */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
				{challengeType === "timed" && (
					<TimerDisplay
						timeLeft={timer.timeLeft}
						totalTime={settings.timeLimit}
					/>
				)}
				{challengeType === "survival" && (
					<LivesDisplay lives={lives.lives} maxLives={lives.maxLives} />
				)}
				{challengeType !== "survival" && challengeType !== "timed" && (
					<Typography
						variant="body1"
						sx={{
							color: "text.cardTitle",
							fontWeight: 600,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{currentCardIndex + 1} / {flashcardsLength}
					</Typography>
				)}
			</Box>

			<Tooltip title={t("restart_game") || "Restart"}>
				<StyledButton
					variant="ghost"
					size="small"
					startIcon={<RefreshIcon />}
					onClick={onRestart}
				>
					{t("restart") || "Restart"}
				</StyledButton>
			</Tooltip>
		</Box>
	);
};

export default GameHeader;
