import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import { StyledButton } from "../ui";
import LivesDisplay from "./LivesDisplay";
import TimerIcon from "@mui/icons-material/Timer";

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
				{challengeType === "timed" && timer && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							px: 2,
							py: 1,
							borderRadius: 2,
							bgcolor:
								timer.timeLeft < 10
									? "rgba(239, 68, 68, 0.1)"
									: "rgba(245, 158, 11, 0.1)",
						}}
					>
						<TimerIcon sx={{ color: timer.timeLeft < 10 ? "#ef4444" : "#f59e0b" }} />
						<Typography
							variant="h6"
							sx={{
								color: timer.timeLeft < 10 ? "#ef4444" : "#f59e0b",
								fontWeight: 700,
								fontFamily: "Inter, sans-serif",
							}}
						>
							{timer.formattedTime}
						</Typography>
					</Box>
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
