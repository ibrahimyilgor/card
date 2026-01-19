import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import TimerIcon from "@mui/icons-material/Timer";
import { StyledButton } from "../ui";
import { PageContainer } from "../ui";
import MatchGrid from "./MatchGrid";

const MotionBox = motion.create(Box);

const MatchView = ({
	flashcards,
	onBackToDecks,
	onRestart,
	onMatchComplete,
	onMatch,
	challengeType,
	timer,
	t,
}) => {
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
				initial={{ y: -20 }}
				animate={{ y: 0 }}
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

					{/* Title or Timer */}
					{challengeType === "timed" && timer ? (
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
							<TimerIcon
								sx={{ color: timer.timeLeft < 10 ? "#ef4444" : "#f59e0b" }}
							/>
							<Typography
								variant="h5"
								sx={{
									color: timer.timeLeft < 10 ? "#ef4444" : "#f59e0b",
									fontWeight: 700,
									fontFamily: "Inter, sans-serif",
								}}
							>
								{timer.formattedTime}
							</Typography>
						</Box>
					) : (
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
					)}

					<StyledButton
						variant="ghost"
						startIcon={<RefreshIcon />}
						onClick={onRestart}
					>
						{t("restart") || "Restart"}
					</StyledButton>
				</Box>
			</MotionBox>

			<MatchGrid
				flashcards={flashcards}
				onComplete={onMatchComplete}
				onMatch={onMatch}
			/>
		</PageContainer>
	);
};

export default MatchView;
