import React, { useContext, useState } from "react";
import { Box, Typography, alpha, useTheme, Collapse, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import ReplayIcon from "@mui/icons-material/Replay";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import StyleIcon from "@mui/icons-material/Style";
import GridViewIcon from "@mui/icons-material/GridView";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { I18nContext } from "../utils/i18n";
import { StyledCard, StyledButton } from "./ui";
import AchievementBadge from "./AchievementBadge";

const MotionBox = motion.create(Box);

function StatItem({ value, label, color, icon: Icon, delay = 0 }) {
	const theme = useTheme();
	return (
		<MotionBox
			initial={{ y: 20 }} animate={{ y: 0 }}
			transition={{ delay, duration: 0.4 }}
			sx={{
				textAlign: "center", p: { xs: 1, sm: 1.5, md: 2 },
				borderRadius: { xs: 2, sm: 3 },
				background: alpha(color, 0.08),
				border: `1px solid ${alpha(color, 0.2)}`,
				minWidth: { xs: 60, sm: 80, md: 90 }, flex: "1 1 0",
			}}
		>
			<Box sx={{
				width: { xs: 28, sm: 36, md: 40 }, height: { xs: 28, sm: 36, md: 40 },
				borderRadius: { xs: "8px", sm: "10px" },
				display: "flex", alignItems: "center", justifyContent: "center",
				background: alpha(color, 0.15), mx: "auto", mb: { xs: 0.5, sm: 1 },
			}}>
				<Icon sx={{ fontSize: { xs: 16, sm: 20, md: 22 }, color }} />
			</Box>
			<Typography variant="h5" sx={{
				fontWeight: 700, color, fontFamily: "Inter, sans-serif",
				mb: 0.25, fontSize: { xs: "0.95rem", sm: "1.2rem", md: "1.5rem" },
			}}>
				{value}
			</Typography>
			<Typography variant="caption" sx={{
				color: "text.cardSubtitle", fontFamily: "Inter, sans-serif",
				fontWeight: 500, fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.75rem" },
			}}>
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
	newAchievements = [],
	cardResults = [],
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const [accordionOpen, setAccordionOpen] = useState(false);
	const totalCards = correctCount + incorrectCount;

	return (
		<MotionBox
			initial={{ scale: 0.95 }} animate={{ scale: 1 }}
			transition={{ duration: 0.5 }}
			sx={{
				display: "flex", flexDirection: "column", alignItems: "center",
				gap: 3, p: 3, maxWidth: 600, mx: "auto",
			}}
		>
			{/* 1. Title */}
			<MotionBox initial={{ y: -10 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>
				<Typography variant="h5" sx={{
					fontWeight: 700, color: "text.primary",
					fontFamily: "Inter, sans-serif", textAlign: "center",
				}}>
					{t("game_summary") || "Game Complete!"}
				</Typography>
			</MotionBox>

			{/* 2. Action Buttons */}
			<MotionBox
				initial={{ y: 20 }} animate={{ y: 0 }}
				transition={{ delay: 0.3, duration: 0.4 }}
				sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}
			>
				<StyledButton variant="secondary" onClick={onBackToDecks} startIcon={<HomeIcon />}>
					{t("back_to_decks") || "Back to Decks"}
				</StyledButton>
				{onChangeMode && (
					<StyledButton variant="secondary" onClick={onChangeMode} startIcon={<SettingsIcon />}>
						{t("change_mode") || "Change Mode"}
					</StyledButton>
				)}
				<StyledButton variant="primary" onClick={onRestart} startIcon={<ReplayIcon />}>
					{t("play_again") || "Play Again"}
				</StyledButton>
			</MotionBox>

			{/* 3. Earned Achievements */}
			{newAchievements.length > 0 && (
				<MotionBox
					initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.5 }}
					sx={{ width: "100%" }}
				>
					<StyledCard sx={{ p: 3, textAlign: "center" }}>
						<Typography variant="body2" sx={{
							fontWeight: 700, fontFamily: "Inter, sans-serif",
							color: "#d4af37", mb: 2, letterSpacing: 1,
							textTransform: "uppercase", fontSize: "0.75rem",
						}}>
							{t("achievements_earned_new") || "Kazanılan Rozetler"}
						</Typography>
						<Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
							{newAchievements.map((a, i) => (
								<MotionBox
									key={a.name}
									initial={{ scale: 0, rotate: -20 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{ delay: 0.6 + i * 0.15, type: "spring", damping: 12 }}
									sx={{ textAlign: "center" }}
								>
									<AchievementBadge
										type={a.category} size={72} earned interactive
										streakDays={a.category === "streak" ? a.threshold : undefined}
										accuracyDays={a.category === "accuracy" ? a.threshold : undefined}
										volumeDays={a.category === "volume" ? a.threshold : undefined}
									/>
									<Typography variant="caption" sx={{
										display: "block", mt: 0.5, color: "text.secondary",
										fontFamily: "Inter, sans-serif", fontSize: "0.65rem",
									}}>
										{t(`achievement_${a.name}`) || a.description}
									</Typography>
								</MotionBox>
							))}
						</Box>
					</StyledCard>
				</MotionBox>
			)}

			{/* 4. Stats + Accordion */}
			<StyledCard variant="elevated" sx={{ width: "100%", p: 4, textAlign: "center" }}>
				{/* Stats Row */}
				<Box sx={{
					display: "flex", justifyContent: "center",
					gap: { xs: 1, sm: 2 }, flexWrap: "nowrap", width: "100%",
				}}>
					{gameMode === "match" ? (
						<>
							<StatItem value={matchPairs} label={t("pairs") || "Pairs"} color={theme.palette.primary.main} icon={StyleIcon} delay={0.6} />
							<StatItem value={matchAttempts} label={t("attempts") || "Attempts"} color="#ec4899" icon={GridViewIcon} delay={0.7} />
						</>
					) : (
						<>
							<StatItem value={correctCount} label={t("correct") || "Correct"} color={theme.palette.success.main} icon={CheckCircleIcon} delay={0.6} />
							<StatItem value={incorrectCount} label={t("incorrect") || "Incorrect"} color={theme.palette.error.main} icon={CancelIcon} delay={0.7} />
							<StatItem value={totalCards} label={t("total") || "Total"} color={theme.palette.primary.main} icon={StyleIcon} delay={0.8} />
						</>
					)}
				</Box>

				{/* Accordion */}
				{cardResults.length > 0 && gameMode !== "match" && (
					<Box sx={{ mt: 3, textAlign: "left" }}>
						<Box
							onClick={() => setAccordionOpen((p) => !p)}
							sx={{
								display: "flex", alignItems: "center", justifyContent: "space-between",
								cursor: "pointer", px: 1, py: 0.5, borderRadius: 2,
								"&:hover": { background: alpha(theme.palette.text.primary, 0.04) },
							}}
						>
							<Typography variant="body2" sx={{
								fontFamily: "Inter, sans-serif", fontWeight: 600,
								color: "text.secondary", fontSize: "0.8rem",
							}}>
								{t("correct") || "Correct"} / {t("incorrect") || "Incorrect"}
							</Typography>
							<IconButton size="small" sx={{ color: "text.secondary" }}>
								{accordionOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
							</IconButton>
						</Box>
						<Collapse in={accordionOpen}>
							<Box sx={{ mt: 1, maxHeight: 300, overflowY: "auto", pr: 0.5 }}>
								{cardResults.map((r, i) => (
									<Box key={i} sx={{
										display: "flex", alignItems: "flex-start", gap: 1.5,
										py: 1, px: 1.5, mb: 0.5, borderRadius: 2,
										background: alpha(r.isCorrect ? theme.palette.success.main : theme.palette.error.main, 0.07),
										border: `1px solid ${alpha(r.isCorrect ? theme.palette.success.main : theme.palette.error.main, 0.18)}`,
									}}>
										{r.isCorrect
											? <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main, mt: "2px", flexShrink: 0 }} />
											: <CancelIcon sx={{ fontSize: 16, color: theme.palette.error.main, mt: "2px", flexShrink: 0 }} />
										}
										<Box>
											<Typography variant="caption" sx={{
												fontFamily: "Inter, sans-serif", fontWeight: 600,
												color: "text.primary", display: "block", lineHeight: 1.4,
											}}>
												{r.front}
											</Typography>
											<Typography variant="caption" sx={{
												fontFamily: "Inter, sans-serif", color: "text.secondary",
												display: "block", lineHeight: 1.4,
											}}>
												{r.back}
											</Typography>
										</Box>
									</Box>
								))}
							</Box>
						</Collapse>
					</Box>
				)}
			</StyledCard>
		</MotionBox>
	);
}
