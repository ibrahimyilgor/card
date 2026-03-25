import React, { useState, useContext, useEffect } from "react";
import {
	getDeckSettings,
	updateDeckSettings,
	getDecks,
} from "../../services/deckServices";
import {
	Box,
	Typography,
	FormControlLabel,
	Checkbox,
	Select,
	MenuItem,
	FormControl,
	Slider,
	alpha,
	useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TuneIcon from "@mui/icons-material/Tune";
import SpeedIcon from "@mui/icons-material/Speed";
import TimerIcon from "@mui/icons-material/Timer";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import QuizIcon from "@mui/icons-material/Quiz";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import GridViewIcon from "@mui/icons-material/GridView";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { I18nContext } from "../../utils/i18n";
import { StyledModal, StyledButton } from "../ui";

const MotionBox = motion.create(Box);

// Game mode definitions (timed and survival are now challenge types, not modes)
const GAME_MODES = [
	{ value: "standard", icon: TuneIcon, color: "#3b82f6" },
	{ value: "write", icon: EditIcon, color: "#22c55e" },
	{ value: "multiple_choice", icon: QuizIcon, color: "#8b5cf6" },
	{ value: "match", icon: GridViewIcon, color: "#ec4899" },
];

// Challenge type definitions
const CHALLENGE_TYPES = [
	{ value: "none", icon: TuneIcon, color: "#6b7280" },
	{ value: "timed", icon: TimerIcon, color: "#f59e0b" },
	{ value: "survival", icon: FavoriteIcon, color: "#ef4444" },
];

// Setting Option Component
function SettingOption({
	icon: Icon,
	title,
	description,
	children,
	delay = 0,
	iconColor,
}) {
	const theme = useTheme();

	return (
		<MotionBox
			initial={{ x: -20 }}
			animate={{ x: 0 }}
			transition={{ delay, duration: 0.3 }}
			sx={{
				p: 2.5,
				borderRadius: 2,
				background: (theme) =>
					theme.palette.mode === "dark"
						? alpha(theme.palette.background.default, 0.5)
						: alpha(theme.palette.grey[100], 0.5),
				border: (theme) => `1px solid ${theme.palette.border.main}`,
				display: "flex",
				flexDirection: { xs: "column", sm: "row" },
				alignItems: { xs: "stretch", sm: "center" },
				justifyContent: "space-between",
				gap: 2,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: iconColor
							? `linear-gradient(135deg, ${alpha(iconColor, 0.2)} 0%, ${alpha(
									iconColor,
									0.1,
								)} 100%)`
							: (theme) =>
									`linear-gradient(135deg, ${alpha(
										theme.palette.primary.main,
										0.15,
									)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
						border: iconColor
							? `1px solid ${alpha(iconColor, 0.3)}`
							: (theme) =>
									`1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
					}}
				>
					<Icon sx={{ fontSize: 20, color: iconColor || "primary.main" }} />
				</Box>
				<Box>
					<Typography
						variant="subtitle2"
						sx={{
							fontWeight: 600,
							color: "text.cardTitle",
							fontFamily: "Inter, sans-serif",
						}}
					>
						{title}
					</Typography>
					{description && (
						<Typography
							variant="caption"
							sx={{
								color: "text.cardSubtitle",
								fontFamily: "Inter, sans-serif",
							}}
						>
							{description}
						</Typography>
					)}
				</Box>
			</Box>
			<Box sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}>
				{children}
			</Box>
		</MotionBox>
	);
}

// Mode Card Component
function ModeCard({ mode, selected, onClick, t }) {
	const Icon = mode.icon;
	const isDark = useTheme().palette.mode === "dark";

	return (
		<MotionBox
			whileHover={{ scale: 1.03 }}
			whileTap={{ scale: 0.97 }}
			onClick={onClick}
			sx={{
				p: 2,
				borderRadius: 2,
				cursor: "pointer",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 1,
				border: `2px solid ${selected ? mode.color : "transparent"}`,
				background: selected
					? alpha(mode.color, 0.1)
					: isDark
						? "rgba(255, 255, 255, 0.03)"
						: "rgba(0, 0, 0, 0.02)",
				transition: "all 0.2s ease",
				"&:hover": {
					background: alpha(mode.color, 0.08),
					borderColor: alpha(mode.color, 0.5),
				},
			}}
		>
			<Box
				sx={{
					width: 44,
					height: 44,
					borderRadius: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: selected
						? `linear-gradient(135deg, ${mode.color} 0%, ${alpha(
								mode.color,
								0.7,
							)} 100%)`
						: `linear-gradient(135deg, ${alpha(mode.color, 0.2)} 0%, ${alpha(
								mode.color,
								0.1,
							)} 100%)`,
					boxShadow: selected ? `0 4px 12px ${alpha(mode.color, 0.4)}` : "none",
				}}
			>
				<Icon sx={{ fontSize: 22, color: selected ? "#fff" : mode.color }} />
			</Box>
			<Typography
				variant="caption"
				sx={{
					fontWeight: selected ? 600 : 500,
					color: selected ? mode.color : "text.cardSubtitle",
					fontFamily: "Inter, sans-serif",
					textAlign: "center",
				}}
			>
				{t(`mode_${mode.value}`) || mode.value}
			</Typography>
		</MotionBox>
	);
}

export default function GameSettingsModal({
	open,
	onClose,
	onStart,
	deckId,
	initialSettings = null,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	const [settings, setSettings] = useState({
		mode: "standard",
		challengeType: "none", // "none", "timed", or "survival"
		timeLimit: 60, // seconds (1 minute default)
		lives: 3,
		cardDirection: "normal", // "normal" or "reverse"
		standardCardCount: 1,
		hardModeEnabled: false, // only study hard cards (saved as difficulty_enabled in db)
	});
	const [deckFlashcardCount, setDeckFlashcardCount] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchSettings = async () => {
			if (!deckId || !open) return;
			try {
				const res = await getDeckSettings(deckId);
				if (res.data && res.data.settings) {
					let flashcardCount = Number(res.data.settings.flashcard_count);
					if (!Number.isFinite(flashcardCount) || flashcardCount < 0) {
						const decksRes = await getDecks();
						const deck = (decksRes.data?.decks || []).find(
							(item) => String(item.id) === String(deckId),
						);
						flashcardCount = Number(deck?.flashcard_count) || 0;
					}
					const maxSelectable = Math.max(1, flashcardCount);
					const initialStandardCardCount = Number(
						initialSettings?.standardCardCount,
					);
					const resolvedStandardCardCount = Number.isFinite(
						initialStandardCardCount,
					)
						? initialStandardCardCount
						: maxSelectable;
					setDeckFlashcardCount(flashcardCount);
					setSettings((prev) => ({
						...prev,
						hardModeEnabled: res.data.settings.difficulty_enabled || false,
						mode: res.data.settings.mode || "standard",
						cardDirection: res.data.settings.card_direction || "normal",
						challengeType: res.data.settings.challenge_type || "none",
						timeLimit: res.data.settings.time_limit || 60,
						lives: res.data.settings.starting_lives || 3,
						standardCardCount: Math.min(
							Math.max(resolvedStandardCardCount, 1),
							maxSelectable,
						),
					}));
				}
			} catch (err) {
				console.error("Error fetching deck settings:", err);
			}
		};
		fetchSettings();
	}, [deckId, open]);

	// When mode changes to "match", disable survival challenge
	useEffect(() => {
		if (settings.mode !== "match") return;

		setSettings((prev) => {
			const next = { ...prev };
			let changed = false;

			if (next.challengeType === "survival") {
				next.challengeType = "none";
				changed = true;
			}
			if (next.cardDirection !== "normal") {
				next.cardDirection = "normal";
				changed = true;
			}

			return changed ? next : prev;
		});
	}, [settings.mode]);

	const handleSaveAndStart = async () => {
		setLoading(true);
		const effectiveCardDirection =
			settings.mode === "match" ? "normal" : settings.cardDirection;
		const effectiveStandardCardCount = Math.min(
			Math.max(settings.standardCardCount || 1, 1),
			Math.max(1, deckFlashcardCount),
		);
		try {
			await updateDeckSettings(deckId, {
				difficulty_enabled: settings.hardModeEnabled,
				mode: settings.mode,
				card_direction: effectiveCardDirection,
				challenge_type: settings.challengeType,
				time_limit: settings.timeLimit,
				starting_lives: settings.lives,
			});
			onStart({
				...settings,
				cardDirection: effectiveCardDirection,
				standardCardCount: effectiveStandardCardCount,
			});
		} catch (err) {
			console.error("Error saving deck settings:", err);
		} finally {
			setLoading(false);
		}
	};

	const selectedMode = GAME_MODES.find((m) => m.value === settings.mode);
	const maxStandardCards = Math.max(1, deckFlashcardCount);
	const displayMaxStandardCards = Math.max(0, deckFlashcardCount);
	const displaySelectedCardCount =
		displayMaxStandardCards === 0
			? 0
			: Math.min(settings.standardCardCount || 1, maxStandardCards);
	const selectedChallenge = CHALLENGE_TYPES.find(
		(c) => c.value === settings.challengeType,
	);

	const getModeDescription = () => {
		switch (settings.mode) {
			case "standard":
				return t("mode_standard_desc") || "Classic flashcard flip mode";
			case "write":
				return t("mode_write_desc") || "Type the answer yourself";
			case "multiple_choice":
				return t("mode_multiple_choice_desc") || "Choose from 4 options";
			case "match":
				return t("mode_match_desc") || "Memory matching game";
			default:
				return "";
		}
	};

	return (
		<StyledModal
			open={open}
			onClose={onClose}
			title={t("game_settings") || "Game Settings"}
			icon={<SportsEsportsIcon sx={{ fontSize: 24, color: "white" }} />}
			maxWidth={700}
			actions={
				<>
					<StyledButton variant="ghost" onClick={onClose}>
						{t("cancel")}
					</StyledButton>
					<StyledButton
						variant="primary"
						onClick={handleSaveAndStart}
						disabled={loading}
					>
						{loading
							? t("starting") || "Starting..."
							: t("start_game") || "Start Game"}
					</StyledButton>
				</>
			}
		>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
				{/* Game Mode Selection */}
				<Box>
					<Typography
						variant="subtitle2"
						sx={{
							fontWeight: 600,
							color: "text.cardTitle",
							fontFamily: "Inter, sans-serif",
							mb: 2,
						}}
					>
						{t("select_game_mode") || "Select Game Mode"}
					</Typography>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "repeat(2, 1fr)",
								sm: "repeat(4, 1fr)",
							},
							gap: 1.5,
						}}
					>
						{GAME_MODES.map((mode) => (
							<ModeCard
								key={mode.value}
								mode={mode}
								selected={settings.mode === mode.value}
								onClick={() =>
									setSettings((prev) => ({ ...prev, mode: mode.value }))
								}
								t={t}
							/>
						))}
					</Box>

					{/* Mode description */}
					<MotionBox
						key={settings.mode}
						initial={{ y: 5 }}
						animate={{ y: 0 }}
						sx={{
							mt: 2,
							p: 2,
							background: alpha(selectedMode?.color || "#3b82f6", 0.08),
							border: `1px solid ${alpha(
								selectedMode?.color || "#3b82f6",
								0.2,
							)}`,
							borderRadius: 1,
						}}
					>
						<Typography
							variant="body2"
							sx={{
								color: selectedMode?.color || "primary.main",
								fontFamily: "Inter, sans-serif",
								fontWeight: 500,
							}}
						>
							{getModeDescription()}
						</Typography>
					</MotionBox>
				</Box>

				{/* Challenge Type Selection */}
				<Box>
					<Typography
						variant="subtitle2"
						sx={{
							fontWeight: 600,
							color: "text.cardTitle",
							fontFamily: "Inter, sans-serif",
							mb: 2,
						}}
					>
						{t("challenge_type") || "Challenge Type"}
					</Typography>

					<ToggleButtonGroup
						value={settings.challengeType}
						exclusive
						onChange={(e, value) => {
							if (value !== null) {
								setSettings((prev) => ({ ...prev, challengeType: value }));
							}
						}}
						size="small"
						fullWidth
						sx={{
							width: "100%",
							"& .MuiToggleButton-root": {
								flex: 1,
								px: 2,
								py: 1.5,
								fontFamily: "Inter, sans-serif",
								fontSize: "0.875rem",
								fontWeight: 500,
								textTransform: "none",
								display: "flex",
								flexDirection: "column",
								gap: 0.5,
								border: (theme) => `1px solid ${theme.palette.border.main}`,
								"&.Mui-selected": {
									backgroundColor: (theme) => {
										const challenge = CHALLENGE_TYPES.find(
											(c) => c.value === settings.challengeType,
										);
										return alpha(challenge?.color || "#6b7280", 0.15);
									},
									color: (theme) => {
										const challenge = CHALLENGE_TYPES.find(
											(c) => c.value === settings.challengeType,
										);
										return challenge?.color || "#6b7280";
									},
									borderColor: (theme) => {
										const challenge = CHALLENGE_TYPES.find(
											(c) => c.value === settings.challengeType,
										);
										return challenge?.color || "#6b7280";
									},
									"&:hover": {
										backgroundColor: (theme) => {
											const challenge = CHALLENGE_TYPES.find(
												(c) => c.value === settings.challengeType,
											);
											return alpha(challenge?.color || "#6b7280", 0.25);
										},
									},
								},
								"&.Mui-disabled": {
									opacity: 0.4,
								},
							},
						}}
					>
						<ToggleButton value="none">
							<TuneIcon sx={{ fontSize: 20, mb: 0.5 }} />
							{t("challenge_none") || "None"}
						</ToggleButton>
						<ToggleButton value="timed">
							<TimerIcon
								sx={{
									fontSize: 20,
									mb: 0.5,
									color:
										settings.challengeType === "timed" ? "#f59e0b" : "inherit",
								}}
							/>
							{t("challenge_timed") || "Timed"}
						</ToggleButton>
						<ToggleButton value="survival" disabled={settings.mode === "match"}>
							<FavoriteIcon
								sx={{
									fontSize: 20,
									mb: 0.5,
									color:
										settings.challengeType === "survival"
											? "#ef4444"
											: "inherit",
								}}
							/>
							{t("challenge_survival") || "Survival"}
						</ToggleButton>
					</ToggleButtonGroup>

					{/* Challenge description */}
					{settings.challengeType !== "none" && (
						<MotionBox
							key={settings.challengeType}
							initial={{ y: 5 }}
							animate={{ y: 0 }}
							sx={{
								mt: 2,
								p: 2,
								borderRadius: 2,
								background: alpha(selectedChallenge?.color || "#6b7280", 0.08),
								border: `1px solid ${alpha(selectedChallenge?.color || "#6b7280", 0.2)}`,
							}}
						>
							<Typography
								variant="body2"
								sx={{
									color: selectedChallenge?.color || "text.secondary",
									fontFamily: "Inter, sans-serif",
									fontWeight: 500,
								}}
							>
								{settings.challengeType === "timed"
									? t("challenge_timed_desc") ||
										"Race against the clock - answer as many cards as possible before time runs out!"
									: t("challenge_survival_desc") ||
										"Limited lives - one wrong answer costs a life. Survive as long as you can!"}
							</Typography>
						</MotionBox>
					)}
				</Box>

				{/* Challenge-specific settings */}
				{settings.challengeType === "timed" && (
					<MotionBox
						initial={{ height: 0 }}
						animate={{ height: "auto" }}
						exit={{ height: 0 }}
					>
						<SettingOption
							icon={TimerIcon}
							title={t("game_duration") || "Game Duration"}
							description={t("game_duration_desc") || "Total time for the game"}
							iconColor="#f59e0b"
						>
							<ToggleButtonGroup
								value={settings.timeLimit}
								exclusive
								onChange={(e, value) => {
									if (value !== null) {
										setSettings((prev) => ({ ...prev, timeLimit: value }));
									}
								}}
								size="small"
								fullWidth
								sx={{
									width: "100%",
									"& .MuiToggleButton-root": {
										flex: 1,
										px: { xs: 1, sm: 2, md: 3 },
										py: 0.5,
										fontFamily: "Inter, sans-serif",
										fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
										fontWeight: 500,
										textTransform: "none",
										whiteSpace: "nowrap",
										border: (theme) => `1px solid ${theme.palette.border.main}`,
										"&.Mui-selected": {
											backgroundColor: alpha("#f59e0b", 0.15),
											color: "#f59e0b",
											borderColor: "#f59e0b",
											"&:hover": {
												backgroundColor: alpha("#f59e0b", 0.25),
											},
										},
									},
								}}
							>
								<ToggleButton value={60}>
									1 {t("minutes_short") || "min"}
								</ToggleButton>
								<ToggleButton value={180}>
									3 {t("minutes_short") || "min"}
								</ToggleButton>
								<ToggleButton value={300}>
									5 {t("minutes_short") || "min"}
								</ToggleButton>
								<ToggleButton value={600}>
									10 {t("minutes_short") || "min"}
								</ToggleButton>
							</ToggleButtonGroup>
						</SettingOption>
					</MotionBox>
				)}

				{settings.challengeType === "survival" && (
					<MotionBox
						initial={{ height: 0 }}
						animate={{ height: "auto" }}
						exit={{ height: 0 }}
					>
						<SettingOption
							icon={FavoriteIcon}
							title={t("starting_lives") || "Starting Lives"}
							description={`${settings.lives} ${t("lives") || "lives"}`}
							iconColor="#ef4444"
						>
							<Box sx={{ width: 120 }}>
								<Slider
									value={settings.lives}
									onChange={(e, value) =>
										setSettings((prev) => ({ ...prev, lives: value }))
									}
									min={1}
									max={5}
									step={1}
									marks
									sx={{
										color: "#ef4444",
										"& .MuiSlider-thumb": {
											"&:hover, &.Mui-focusVisible": {
												boxShadow: `0 0 0 8px ${alpha("#ef4444", 0.16)}`,
											},
										},
									}}
								/>
							</Box>
						</SettingOption>
					</MotionBox>
				)}

				{/* Card Direction Option */}
				{settings.mode !== "match" && (
					<SettingOption
						icon={SwapHorizIcon}
						title={t("card_direction") || "Card Direction"}
						description={
							t("card_direction_desc") || "Choose which side to show first"
						}
						iconColor="#06b6d4"
						delay={0.1}
					>
						<ToggleButtonGroup
							value={settings.cardDirection}
							exclusive
							onChange={(e, value) => {
								if (value !== null) {
									setSettings((prev) => ({ ...prev, cardDirection: value }));
								}
							}}
							size="small"
							fullWidth
							sx={{
								width: "100%",
								"& .MuiToggleButton-root": {
									flex: 1,
									width: "50%",
									minWidth: 0,
									px: 2,
									py: 0.5,
									fontFamily: "Inter, sans-serif",
									fontSize: "0.75rem",
									fontWeight: 500,
									textTransform: "none",
									border: (theme) => `1px solid ${theme.palette.border.main}`,
									"&.Mui-selected": {
										backgroundColor: alpha("#06b6d4", 0.15),
										color: "#06b6d4",
										borderColor: "#06b6d4",
										"&:hover": {
											backgroundColor: alpha("#06b6d4", 0.25),
										},
									},
								},
							}}
						>
							<ToggleButton value="normal">
								{t("direction_normal") || "Normal"}
							</ToggleButton>
							<ToggleButton value="reverse">
								{t("direction_reverse") || "Reverse"}
							</ToggleButton>
						</ToggleButtonGroup>
					</SettingOption>
				)}

				{settings.challengeType === "none" && (
					<SettingOption
						icon={SpeedIcon}
						title={t("card_count") || "Card Count"}
						description={
							t("card_count_desc") || "Choose how many random cards to study"
						}
						iconColor="#3b82f6"
						delay={0.12}
					>
						<Box sx={{ minWidth: 170 }}>
							<Slider
								value={displaySelectedCardCount || 1}
								onChange={(e, value) =>
									setSettings((prev) => ({
										...prev,
										standardCardCount: value,
									}))
								}
								min={1}
								max={maxStandardCards}
								step={1}
								disabled={deckFlashcardCount === 0}
								valueLabelDisplay="auto"
								sx={{
									color: "#3b82f6",
									"& .MuiSlider-thumb": {
										"&:hover, &.Mui-focusVisible": {
											boxShadow: `0 0 0 8px ${alpha("#3b82f6", 0.16)}`,
										},
									},
								}}
							/>
							<Typography
								variant="caption"
								sx={{
									display: "block",
									textAlign: "center",
									color: "text.cardSubtitle",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{`${displaySelectedCardCount} / ${displayMaxStandardCards}`}
							</Typography>
						</Box>
					</SettingOption>
				)}

				{/* Hard Mode Option */}
				<SettingOption
					icon={WhatshotIcon}
					title={t("hard_mode") || "Hard Mode"}
					description={t("hard_mode_desc") || "Only study cards you got wrong"}
					iconColor="#f97316"
					delay={0.15}
				>
					<Checkbox
						checked={settings.hardModeEnabled}
						onChange={(e) =>
							setSettings((prev) => ({
								...prev,
								hardModeEnabled: e.target.checked,
							}))
						}
						sx={{
							color: "#f97316",
							"&.Mui-checked": {
								color: "#f97316",
							},
						}}
					/>
				</SettingOption>
			</Box>
		</StyledModal>
	);
}
