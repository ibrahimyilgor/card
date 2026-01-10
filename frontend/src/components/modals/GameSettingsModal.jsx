import React, { useState, useContext, useEffect } from "react";
import {
	getDeckSettings,
	updateDeckSettings,
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

// Game mode definitions (reverse and hard_cards removed - they are now separate options)
const GAME_MODES = [
	{ value: "standard", icon: TuneIcon, color: "#3b82f6" },
	{ value: "timed", icon: TimerIcon, color: "#f59e0b" },
	{ value: "survival", icon: FavoriteIcon, color: "#ef4444" },
	{ value: "write", icon: EditIcon, color: "#22c55e" },
	{ value: "multiple_choice", icon: QuizIcon, color: "#8b5cf6" },
	{ value: "match", icon: GridViewIcon, color: "#ec4899" },
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
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay, duration: 0.3 }}
			sx={{
				p: 2.5,
				borderRadius: 3,
				background: (theme) =>
					theme.palette.mode === "dark"
						? alpha(theme.palette.background.default, 0.5)
						: alpha(theme.palette.grey[100], 0.5),
				border: (theme) => `1px solid ${theme.palette.border.main}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 2,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: "10px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: iconColor
							? `linear-gradient(135deg, ${alpha(iconColor, 0.2)} 0%, ${alpha(
									iconColor,
									0.1
							  )} 100%)`
							: (theme) =>
									`linear-gradient(135deg, ${alpha(
										theme.palette.primary.main,
										0.15
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
			<Box sx={{ flexShrink: 0 }}>{children}</Box>
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
				borderRadius: 3,
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
					borderRadius: "12px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: selected
						? `linear-gradient(135deg, ${mode.color} 0%, ${alpha(
								mode.color,
								0.7
						  )} 100%)`
						: `linear-gradient(135deg, ${alpha(mode.color, 0.2)} 0%, ${alpha(
								mode.color,
								0.1
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
		timeLimit: 10,
		lives: 3,
		cardDirection: "normal", // "normal" or "reverse"
		hardModeEnabled: false, // only study hard cards (saved as difficulty_enabled in db)
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchSettings = async () => {
			if (!deckId || !open) return;
			try {
				const res = await getDeckSettings(deckId);
				if (res.data && res.data.settings) {
					setSettings((prev) => ({
						...prev,
						hardModeEnabled: res.data.settings.difficulty_enabled || false,
						mode: res.data.settings.mode || "standard",
						cardDirection: res.data.settings.card_direction || "normal",
					}));
				}
			} catch (err) {
				console.error("Error fetching deck settings:", err);
			}
		};
		fetchSettings();
	}, [deckId, open]);

	const handleSaveAndStart = async () => {
		setLoading(true);
		try {
			await updateDeckSettings(deckId, {
				difficulty_enabled: settings.hardModeEnabled,
				mode: settings.mode,
				card_direction: settings.cardDirection,
			});
			onStart(settings);
		} catch (err) {
			console.error("Error saving deck settings:", err);
		} finally {
			setLoading(false);
		}
	};

	const selectedMode = GAME_MODES.find((m) => m.value === settings.mode);

	const getModeDescription = () => {
		switch (settings.mode) {
			case "standard":
				return t("mode_standard_desc") || "Classic flashcard flip mode";
			case "timed":
				return t("mode_timed_desc") || "Race against the clock";
			case "survival":
				return t("mode_survival_desc") || "Limited lives, no room for mistakes";
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
			maxWidth={600}
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
							gridTemplateColumns: "repeat(4, 1fr)",
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
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						sx={{
							mt: 2,
							p: 2,
							borderRadius: 2,
							background: alpha(selectedMode?.color || "#3b82f6", 0.08),
							border: `1px solid ${alpha(
								selectedMode?.color || "#3b82f6",
								0.2
							)}`,
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

				{/* Mode-specific settings */}
				{settings.mode === "timed" && (
					<MotionBox
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
					>
						<SettingOption
							icon={TimerIcon}
							title={t("time_per_card") || "Time Per Card"}
							description={`${settings.timeLimit} ${t("seconds") || "seconds"}`}
							iconColor="#f59e0b"
						>
							<Box sx={{ width: 120 }}>
								<Slider
									value={settings.timeLimit}
									onChange={(e, value) =>
										setSettings((prev) => ({ ...prev, timeLimit: value }))
									}
									min={5}
									max={30}
									step={5}
									marks
									sx={{
										color: "#f59e0b",
										"& .MuiSlider-thumb": {
											"&:hover, &.Mui-focusVisible": {
												boxShadow: `0 0 0 8px ${alpha("#f59e0b", 0.16)}`,
											},
										},
									}}
								/>
							</Box>
						</SettingOption>
					</MotionBox>
				)}

				{settings.mode === "survival" && (
					<MotionBox
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
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
						sx={{
							"& .MuiToggleButton-root": {
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

				{/* Keyboard shortcuts info */}
				<MotionBox
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.3 }}
					sx={{
						p: 2,
						borderRadius: 2,
						background: (theme) => alpha(theme.palette.info.main, 0.08),
						border: (theme) =>
							`1px solid ${alpha(theme.palette.info.main, 0.2)}`,
					}}
				>
					<Typography
						variant="caption"
						sx={{
							color: "info.main",
							fontFamily: "Inter, sans-serif",
							display: "block",
						}}
					>
						💡{" "}
						{t("keyboard_tip") ||
							"Keyboard shortcuts: Space/Enter to flip, Arrow keys or 1-4 for answers"}
					</Typography>
				</MotionBox>
			</Box>
		</StyledModal>
	);
}
