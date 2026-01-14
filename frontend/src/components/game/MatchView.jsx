import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
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
