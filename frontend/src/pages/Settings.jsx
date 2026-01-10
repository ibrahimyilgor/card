import {
	Box,
	Typography,
	useTheme,
	Snackbar,
	Alert,
	Switch,
	Select,
	MenuItem,
	FormControl,
	Divider,
	alpha,
} from "@mui/material";
import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { I18nContext } from "../utils/i18n";
import {
	updateTheme,
	updateLanguage,
	updateSoundEffects,
} from "../services/accountServices";
import TranslateIcon from "@mui/icons-material/Translate";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PaletteIcon from "@mui/icons-material/Palette";
import NotificationsIcon from "@mui/icons-material/Notifications";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import { PageContainer, StyledCard, StyledButton } from "../components/ui";

const MotionBox = motion.create(Box);

// Setting Card Component
function SettingCard({ icon: Icon, title, description, children, delay = 0 }) {
	const theme = useTheme();

	return (
		<MotionBox
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.4 }}
		>
			<StyledCard
				variant="default"
				sx={{
					p: 3,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 3,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flex: 1 }}>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: "12px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: `linear-gradient(135deg, ${alpha(
								theme.palette.primary.main,
								0.15
							)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
							border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
						}}
					>
						<Icon sx={{ fontSize: 24, color: "primary.main" }} />
					</Box>
					<Box>
						<Typography
							variant="subtitle1"
							sx={{
								fontWeight: 600,
								color: "text.cardTitle",
								fontFamily: "Inter, sans-serif",
								mb: 0.25,
							}}
						>
							{title}
						</Typography>
						{description && (
							<Typography
								variant="body2"
								sx={{
									color: "text.cardSubtitle",
									fontFamily: "Inter, sans-serif",
									fontSize: "0.85rem",
								}}
							>
								{description}
							</Typography>
						)}
					</Box>
				</Box>
				<Box sx={{ flexShrink: 0 }}>{children}</Box>
			</StyledCard>
		</MotionBox>
	);
}

// Section Header Component
function SectionHeader({ title, delay = 0 }) {
	return (
		<MotionBox
			initial={{ opacity: 0, x: -20 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.4 }}
			sx={{ mb: 2, mt: 3 }}
		>
			<Typography
				variant="overline"
				sx={{
					color: "text.cardSubtitle",
					fontWeight: 600,
					letterSpacing: "0.1em",
					fontSize: "0.75rem",
					fontFamily: "Inter, sans-serif",
				}}
			>
				{title}
			</Typography>
		</MotionBox>
	);
}

export default function Settings({
	currentTheme,
	onThemeChange,
	onLangChange,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const [selectedTheme, setSelectedTheme] = useState(currentTheme || "dark");
	const [selectedLang, setSelectedLang] = useState(
		localStorage.getItem("lang") || "en"
	);
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Local preferences (stored in localStorage only)
	const [soundEnabled, setSoundEnabled] = useState(
		() => localStorage.getItem("soundEnabled") !== "false"
	);

	const handleThemeChangeLocal = (e) => {
		setSelectedTheme(e.target.checked ? "light" : "dark");
	};

	const handleLangChange = (e) => {
		setSelectedLang(e.target.value);
	};

	const handleSoundChange = (e) => {
		setSoundEnabled(e.target.checked);
	};

	const handleSave = async () => {
		setLoading(true);
		const accountId = localStorage.getItem("accountId");
		try {
			// Update theme
			const themeRes = await updateTheme(selectedTheme, accountId);
			if (themeRes.status !== 200)
				throw new Error(themeRes.data?.error || "Failed to update theme");
			if (onThemeChange) onThemeChange(selectedTheme);

			// Update language
			const langRes = await updateLanguage(selectedLang, accountId);
			if (langRes.status !== 200)
				throw new Error(langRes.data?.error || "Failed to update language");
			localStorage.setItem("lang", selectedLang);
			if (onLangChange) onLangChange(selectedLang);

			// Update sound effects
			const soundRes = await updateSoundEffects(soundEnabled, accountId);
			if (soundRes.status !== 200)
				throw new Error(
					soundRes.data?.error || "Failed to update sound effects"
				);
			localStorage.setItem("soundEnabled", soundEnabled);

			setSaveSuccess(true);
			setSnackbar({
				open: true,
				message: t("settings_saved") || "Settings saved successfully!",
				severity: "success",
			});
			setTimeout(() => setSaveSuccess(false), 2000);
		} catch (err) {
			setSnackbar({
				open: true,
				message:
					err.message || t("settings_save_error") || "Error saving settings!",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const hasChanges =
		selectedTheme !== currentTheme ||
		selectedLang !== (localStorage.getItem("lang") || "en") ||
		soundEnabled !== (localStorage.getItem("soundEnabled") !== "false");

	return (
		<PageContainer>
			<Box sx={{ mx: "auto", pb: 4 }}>
				{/* Header */}
				<MotionBox
					initial={{ opacity: 0, y: -10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					sx={{ mb: 4 }}
				>
					<Typography
						variant="h4"
						sx={{
							fontWeight: 700,
							color: "text.cardTitle",
							fontFamily: "Inter, sans-serif",
							display: "flex",
							alignItems: "center",
							gap: 1.5,
						}}
					>
						<SettingsIcon sx={{ color: "primary.light", fontSize: 32 }} />
						{t("settings")}
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: "text.cardSubtitle",
							mt: 0.5,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{t("customize_experience") || "Customize your learning experience"}
					</Typography>
				</MotionBox>

				{/* Appearance Section */}
				<SectionHeader title={t("appearance") || "Appearance"} delay={0.1} />

				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					<SettingCard
						icon={PaletteIcon}
						title={t("theme")}
						description={
							t("theme_desc") || "Switch between dark and light mode"
						}
						delay={0.15}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<DarkModeIcon
								sx={{
									fontSize: 20,
									color:
										selectedTheme === "dark"
											? "primary.main"
											: "text.cardSubtitle",
									transition: "color 0.3s",
								}}
							/>
							<Switch
								checked={selectedTheme === "light"}
								onChange={handleThemeChangeLocal}
								color="primary"
								sx={{
									"& .MuiSwitch-track": {
										borderRadius: 20,
									},
								}}
							/>
							<LightModeIcon
								sx={{
									fontSize: 20,
									color:
										selectedTheme === "light"
											? "warning.main"
											: "text.cardSubtitle",
									transition: "color 0.3s",
								}}
							/>
						</Box>
					</SettingCard>

					<SettingCard
						icon={TranslateIcon}
						title={t("language")}
						description={t("language_desc") || "Choose your preferred language"}
						delay={0.2}
					>
						<FormControl size="small" sx={{ minWidth: 140 }}>
							<Select
								value={selectedLang}
								onChange={handleLangChange}
								sx={{
									fontWeight: 500,
									fontSize: "0.9rem",
									borderRadius: 2,
									fontFamily: "Inter, sans-serif",
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "border.main",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "primary.main",
									},
								}}
							>
								<MenuItem value="en">{t("english")}</MenuItem>
								<MenuItem value="tr">{t("turkish")}</MenuItem>
							</Select>
						</FormControl>
					</SettingCard>
				</Box>

				{/* Preferences Section */}
				<SectionHeader title={t("preferences") || "Preferences"} delay={0.25} />

				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					<SettingCard
						icon={VolumeUpIcon}
						title={t("sound_effects") || "Sound Effects"}
						description={
							t("sound_effects_desc") ||
							"Play sounds for correct/incorrect answers"
						}
						delay={0.3}
					>
						<Switch
							checked={soundEnabled}
							onChange={handleSoundChange}
							color="primary"
						/>
					</SettingCard>
				</Box>

				{/* Save Button */}
				<MotionBox
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.4 }}
					sx={{ mt: 4, display: "flex", justifyContent: "center" }}
				>
					<StyledButton
						variant={saveSuccess ? "success" : "primary"}
						onClick={handleSave}
						disabled={loading || !hasChanges}
						sx={{
							minWidth: 200,
							py: 1.5,
						}}
					>
						<AnimatePresence mode="wait" initial={false}>
							{saveSuccess ? (
								<MotionBox
									key="success"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									exit={{ scale: 0 }}
									sx={{ display: "flex", alignItems: "center", gap: 1 }}
								>
									<CheckCircleIcon sx={{ fontSize: 20 }} />
									{t("settings_saved") || "Saved!"}
								</MotionBox>
							) : (
								<MotionBox
									key="save"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									{loading ? t("saving") : t("save")}
								</MotionBox>
							)}
						</AnimatePresence>
					</StyledButton>
				</MotionBox>

				{!hasChanges && (
					<MotionBox
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						sx={{ textAlign: "center", mt: 1 }}
					>
						<Typography
							variant="caption"
							sx={{
								color: "text.cardSubtitle",
								fontFamily: "Inter, sans-serif",
							}}
						>
							{t("no_unsaved_changes") || "No unsaved changes"}
						</Typography>
					</MotionBox>
				)}
			</Box>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					severity={snackbar.severity}
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					sx={{
						borderRadius: 2,
						fontFamily: "Inter, sans-serif",
					}}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</PageContainer>
	);
}
