import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	Typography,
	Box,
	TextField,
	Alert,
	Snackbar,
	useTheme,
	alpha,
	InputAdornment,
	IconButton,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LockIcon from "@mui/icons-material/Lock";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
	getAccountInfo,
	changePassword,
	deleteAccount,
} from "../services/accountServices";
import { useNavigate } from "react-router-dom";
import {
	PageContainer,
	StyledCard,
	StyledButton,
	ConfirmModal,
} from "../components/ui";
import { I18nContext } from "../utils/i18n";

const MotionBox = motion.create(Box);

// Info Card Component
function InfoCard({ icon: Icon, title, value, delay = 0 }) {
	const theme = useTheme();

	return (
		<MotionBox
			initial={{ y: 20 }}
			animate={{ y: 0 }}
			transition={{ delay, duration: 0.4 }}
		>
			<StyledCard
				variant="default"
				sx={{
					p: 3,
					display: "flex",
					alignItems: "center",
					gap: 2.5,
				}}
			>
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
				<Box sx={{ flex: 1 }}>
					<Typography
						variant="body2"
						sx={{
							color: "text.cardSubtitle",
							fontFamily: "Inter, sans-serif",
							fontSize: "0.85rem",
							mb: 0.5,
						}}
					>
						{title}
					</Typography>
					<Typography
						variant="subtitle1"
						sx={{
							fontWeight: 600,
							color: "text.cardTitle",
							fontFamily: "Inter, sans-serif",
						}}
					>
						{value}
					</Typography>
				</Box>
			</StyledCard>
		</MotionBox>
	);
}

// Section Header Component
function SectionHeader({ title, delay = 0 }) {
	return (
		<MotionBox
			initial={{ x: -20 }}
			animate={{ x: 0 }}
			transition={{ delay, duration: 0.4 }}
			sx={{ mb: 2, mt: 4 }}
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

export default function Account() {
	const theme = useTheme();
	const navigate = useNavigate();
	const { t, lang } = useContext(I18nContext);
	const [account, setAccount] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Change password states
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
	const [pwError, setPwError] = useState("");
	const [pwLoading, setPwLoading] = useState(false);
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showNewPasswordRepeat, setShowNewPasswordRepeat] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	// Delete account states
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		getAccountInfo()
			.then((res) => {
				setAccount(res.data.account);
				setLoading(false);
			})
			.catch(() => {
				setError(t("account_info_error"));
				setLoading(false);
			});
	}, []);

	const handleChangePassword = async (e) => {
		e.preventDefault();
		setPwError("");
		setPwLoading(true);
		// Password rules: min 8 characters, must contain letters and numbers
		if (
			newPassword.length < 8 ||
			!/[A-Za-z]/.test(newPassword) ||
			!/[0-9]/.test(newPassword)
		) {
			setPwError(t("password_rule_error"));
			setPwLoading(false);
			return;
		}
		if (newPassword !== newPasswordRepeat) {
			setPwError(t("passwords_dont_match"));
			setPwLoading(false);
			return;
		}
		try {
			await changePassword(oldPassword, newPassword, newPasswordRepeat);
			setSnackbar({
				open: true,
				message: t("password_changed_success"),
				severity: "success",
			});
			setOldPassword("");
			setNewPassword("");
			setNewPasswordRepeat("");
		} catch (err) {
			setPwError(err?.response?.data?.error || t("password_change_failed"));
		}
		setPwLoading(false);
	};

	const handleDeleteAccount = async () => {
		setDeleteLoading(true);
		try {
			await deleteAccount();
			// Clear token and redirect to login
			localStorage.removeItem("token");
			navigate("/login");
		} catch (err) {
			setSnackbar({
				open: true,
				message: err?.response?.data?.error || t("delete_account_error"),
				severity: "error",
			});
			setDeleteLoading(false);
			setDeleteModalOpen(false);
		}
	};

	const formatDate = (dateStr) => {
		const date = new Date(dateStr);
		const localeMap = {
			tr: "tr-TR",
			en: "en-US",
			// Add more languages here as needed
		};
		const locale = localeMap[lang] || "en-US";
		return date.toLocaleDateString(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<PageContainer>
			<Box sx={{ mx: "auto", pb: 4 }}>
				{/* Header */}
				<MotionBox initial={{ y: -10 }} animate={{ y: 0 }} sx={{ mb: 4 }}>
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
						<AccountCircleIcon sx={{ color: "primary.light", fontSize: 32 }} />
						{t("account")}
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: "text.cardSubtitle",
							mt: 0.5,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{t("account_page_subtitle")}
					</Typography>
				</MotionBox>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{/* Account Info Section */}
				<SectionHeader title={t("account_info_section_title")} delay={0.1} />

				{loading ? (
					<Box sx={{ display: "flex", gap: 2 }}>
						<StyledCard variant="default" sx={{ p: 3, flex: 1 }}>
							<Typography color="text.cardSubtitle">{t("loading")}</Typography>
						</StyledCard>
					</Box>
				) : (
					account && (
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
								gap: 2,
							}}
						>
							<InfoCard
								icon={PersonIcon}
								title={t("username")}
								value={account.accountname}
								delay={0.15}
							/>
							<InfoCard
								icon={CalendarTodayIcon}
								title={t("account_created_at")}
								value={formatDate(account.created_at)}
								delay={0.2}
							/>
						</Box>
					)
				)}

				{/* Security Section - Change Password & Delete Account */}
				<SectionHeader
					title={t("security_section_title") || "Security"}
					delay={0.25}
				/>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
						gap: 3,
					}}
				>
					{/* Change Password */}
					<MotionBox
						initial={{ y: 20 }}
						animate={{ y: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
						sx={{ height: "100%" }}
					>
						<StyledCard variant="default" sx={{ p: 3, height: "100%" }}>
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
							>
								<Box
									sx={{
										width: 48,
										height: 48,
										borderRadius: "12px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										background: `linear-gradient(135deg, ${alpha(
											theme.palette.warning.main,
											0.15
										)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
										border: `1px solid ${alpha(
											theme.palette.warning.main,
											0.2
										)}`,
									}}
								>
									<VpnKeyIcon sx={{ fontSize: 24, color: "warning.main" }} />
								</Box>
								<Box>
									<Typography
										variant="subtitle1"
										sx={{
											fontWeight: 600,
											color: "text.cardTitle",
											fontFamily: "Inter, sans-serif",
										}}
									>
										{t("update_password_title")}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: "text.cardSubtitle",
											fontFamily: "Inter, sans-serif",
											fontSize: "0.85rem",
										}}
									>
										{t("update_password_subtitle")}
									</Typography>
								</Box>
							</Box>

							{pwError && (
								<Alert severity="error" sx={{ mb: 2 }}>
									{pwError}
								</Alert>
							)}

							<Box
								component="form"
								onSubmit={handleChangePassword}
								sx={{ maxWidth: 400 }}
							>
								<TextField
									label={t("current_password")}
									type={showOldPassword ? "text" : "password"}
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									fullWidth
									sx={{ mb: 2 }}
									required
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon sx={{ color: "text.cardSubtitle" }} />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowOldPassword(!showOldPassword)}
													edge="end"
													size="small"
												>
													{showOldPassword ? (
														<VisibilityOffIcon />
													) : (
														<VisibilityIcon />
													)}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
								<TextField
									label={t("new_password")}
									type={showNewPassword ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									fullWidth
									sx={{ mb: 2 }}
									required
									helperText={t("password_rule_helper_text")}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon sx={{ color: "text.cardSubtitle" }} />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowNewPassword(!showNewPassword)}
													edge="end"
													size="small"
												>
													{showNewPassword ? (
														<VisibilityOffIcon />
													) : (
														<VisibilityIcon />
													)}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
								<TextField
									label={t("new_password_repeat")}
									type={showNewPasswordRepeat ? "text" : "password"}
									value={newPasswordRepeat}
									onChange={(e) => setNewPasswordRepeat(e.target.value)}
									fullWidth
									sx={{ mb: 3 }}
									required
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon sx={{ color: "text.cardSubtitle" }} />
											</InputAdornment>
										),
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() =>
														setShowNewPasswordRepeat(!showNewPasswordRepeat)
													}
													edge="end"
													size="small"
												>
													{showNewPasswordRepeat ? (
														<VisibilityOffIcon />
													) : (
														<VisibilityIcon />
													)}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
								<StyledButton
									type="submit"
									variant="primary"
									fullWidth
									disabled={pwLoading}
									startIcon={
										pwLoading ? null : <CheckCircleIcon sx={{ fontSize: 20 }} />
									}
								>
									{pwLoading ? t("changing") : t("change_password_button")}
								</StyledButton>
							</Box>
						</StyledCard>
					</MotionBox>

					{/* Danger Zone - Delete Account */}
					<MotionBox
						initial={{ y: 20 }}
						animate={{ y: 0 }}
						transition={{ delay: 0.4, duration: 0.4 }}
						sx={{ height: "100%" }}
					>
						<StyledCard
							variant="default"
							sx={{
								p: 3,
								height: "100%",
								border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
								background: alpha(theme.palette.error.main, 0.02),
								display: "flex",
								flexDirection: "column",
							}}
						>
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
							>
								<Box
									sx={{
										width: 48,
										height: 48,
										borderRadius: "12px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										background: alpha(theme.palette.error.main, 0.15),
										border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
									}}
								>
									<DeleteForeverIcon
										sx={{ fontSize: 24, color: "error.main" }}
									/>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="subtitle1"
										sx={{
											fontWeight: 600,
											color: "text.cardTitle",
											fontFamily: "Inter, sans-serif",
										}}
									>
										{t("delete_account_title")}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: "text.cardSubtitle",
											fontFamily: "Inter, sans-serif",
										}}
									>
										{t("delete_account_message")}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ mt: "auto" }}>
								<StyledButton
									variant="danger"
									onClick={() => setDeleteModalOpen(true)}
									startIcon={<DeleteForeverIcon sx={{ fontSize: 20 }} />}
								>
									{t("delete_account")}
								</StyledButton>
							</Box>
						</StyledCard>
					</MotionBox>
				</Box>
			</Box>

			{/* Delete Account Confirmation Modal */}
			<ConfirmModal
				open={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDeleteAccount}
				title={t("delete_account_title")}
				message={t("delete_account_message")}
				confirmText={
					deleteLoading ? t("deleting") : t("delete_account_confirm")
				}
				cancelText={t("cancel")}
				variant="danger"
				icon={DeleteForeverIcon}
				loading={deleteLoading}
			/>

			{/* Snackbar */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</PageContainer>
	);
}
