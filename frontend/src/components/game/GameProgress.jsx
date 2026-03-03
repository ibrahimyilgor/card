import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

const GameProgress = ({ scores, progress, gameMode, t, challengeType }) => {
	// If challengeType is provided, use it to decide whether to hide the progress bar.
	// Fall back to checking gameMode for backward compatibility.
	const isTimedOrSurvival =
		(challengeType &&
			(challengeType === "timed" || challengeType === "survival")) ||
		(!challengeType && (gameMode === "timed" || gameMode === "survival"));

	return (
		<>
			{/* Progress bar - hidden for survival and timed modes */}
			{!isTimedOrSurvival && (
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
								challengeType === "timed" || gameMode === "timed"
									? "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)"
									: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
						},
					}}
				/>
			)}

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
						{scores.incorrect} {t("Incorrect") || "incorrect"}
					</Typography>
				</Box>
			</Box>
		</>
	);
};

export default GameProgress;
