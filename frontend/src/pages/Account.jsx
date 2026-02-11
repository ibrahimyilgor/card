import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSEO } from "../utils/seo";
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
	Avatar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// password-related icons removed
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { getMyPlan, resetStatistics } from "../services/accountServices";
import { deleteAccount } from "../services/authServices";
import { firebaseAuth } from "../config/firebase";
// firebase auth password helpers removed
import { useNavigate } from "react-router-dom";
import {
	PageContainer,
	StyledCard,
	StyledButton,
	ConfirmModal,
	AccountSkeleton,
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
							0.15,
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

	// SEO meta tags for account page
	useSEO("account");

	const [account, setAccount] = useState(null);
	const [plan, setPlan] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// (password update feature removed)
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	// Delete account states
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// Reset statistics states
	const [resetModalOpen, setResetModalOpen] = useState(false);
	const [resetLoading, setResetLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		const firebaseUser = firebaseAuth.getCurrentUser();

		getMyPlan()
			.then((planRes) => {
				setAccount({
					email: firebaseUser?.email,
					displayName: firebaseUser?.displayName,
					photoURL: firebaseUser?.photoURL,
					created_at: firebaseUser?.metadata?.creationTime,
				});
				setPlan(planRes.data.plan);
				setLoading(false);
			})
			.catch(() => {
				setError(t("account_info_error"));
				setLoading(false);
			});
	}, []);

	// password change handler removed

	const handleDeleteAccount = async () => {
		setDeleteLoading(true);
		try {
			await deleteAccount();
			// Redirect to login - authServices.deleteAccount handles cleanup
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

	const handleResetStatistics = async () => {
		setResetLoading(true);
		try {
			await resetStatistics();
			setSnackbar({
				open: true,
				message:
					t("statistics_reset_success") || "Statistics reset successfully",
				severity: "success",
			});
			setResetModalOpen(false);
		} catch (err) {
			setSnackbar({
				open: true,
				message:
					err?.response?.data?.error ||
					t("statistics_reset_error") ||
					"Failed to reset statistics",
				severity: "error",
			});
		} finally {
			setResetLoading(false);
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
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 2,
						}}
					>
						{account?.photoURL ? (
							<Avatar
								src={account.photoURL}
								alt={account.displayName || "Profile"}
								sx={{
									width: 48,
									height: 48,
									borderRadius: "12px",
									boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
								}}
							/>
						) : (
							<AccountCircleIcon
								sx={{ color: "primary.light", fontSize: 48 }}
							/>
						)}
						<Box>
							<Typography
								variant="h4"
								sx={{
									fontWeight: 700,
									color: "text.cardTitle",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{account?.displayName || t("account")}
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
						</Box>
					</Box>
				</MotionBox>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{loading ? (
					<AccountSkeleton />
				) : (
					<>
						{/* Account Info Section */}
						<SectionHeader
							title={t("account_info_section_title")}
							delay={0.1}
						/>

						{account && (
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
									gap: 2,
								}}
							>
								<InfoCard
									icon={EmailIcon}
									title={t("email")}
									value={account.email}
									delay={0.15}
								/>
								<InfoCard
									icon={CalendarTodayIcon}
									title={t("account_created_at")}
									value={formatDate(account.created_at)}
									delay={0.2}
								/>
								{/* Subscription Card with Upgrade Button */}
								<MotionBox
									initial={{ y: 20 }}
									animate={{ y: 0 }}
									transition={{ delay: 0.25, duration: 0.4 }}
								>
									<StyledCard
										variant="default"
										sx={{
											p: 3,
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											gap: 2,
										}}
									>
										<Box
											sx={{ display: "flex", alignItems: "center", gap: 2.5 }}
										>
											<Box
												sx={{
													width: 48,
													height: 48,
													borderRadius: "12px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													background:
														plan?.code === "free"
															? `linear-gradient(135deg, ${alpha(theme.palette.text.secondary, 0.15)} 0%, ${alpha(theme.palette.text.secondary, 0.05)} 100%)`
															: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
													border:
														plan?.code === "free"
															? `1px solid ${alpha(theme.palette.text.secondary, 0.2)}`
															: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
												}}
											>
												{plan?.code === "free" ? (
													<StarOutlineIcon
														sx={{ fontSize: 24, color: "text.secondary" }}
													/>
												) : (
													<StarIcon
														sx={{ fontSize: 24, color: "warning.main" }}
													/>
												)}
											</Box>
											<Box>
												<Typography
													variant="body2"
													sx={{
														color: "text.cardSubtitle",
														fontFamily: "Inter, sans-serif",
														fontSize: "0.85rem",
														mb: 0.5,
													}}
												>
													{t("subscription")}
												</Typography>
												<Typography
													variant="subtitle1"
													sx={{
														fontWeight: 600,
														color: "text.cardTitle",
														fontFamily: "Inter, sans-serif",
													}}
												>
													{plan?.name || t("free_plan")}
												</Typography>
											</Box>
										</Box>
										<StyledButton
											variant={plan?.code === "free" ? "contained" : "outlined"}
											size="small"
											onClick={() => navigate("/plans")}
										>
											{plan?.code === "free" ? t("upgrade") : t("view_plans")}
										</StyledButton>
									</StyledCard>
								</MotionBox>
							</Box>
						)}

						{/* Security Section - Change Password & Delete Account */}
						<SectionHeader
							title={t("security_section_title") || "Security"}
							delay={0.25}
						/>

						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", md: "1fr" },
								gap: 3,
								alignItems: "stretch",
							}}
						>
							{/* Right Column - Danger Zone (side-by-side on md+) */}
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
									gap: 3,
									height: "100%",
								}}
							>
								{/* Reset Statistics */}
								<MotionBox
									initial={{ y: 20 }}
									animate={{ y: 0 }}
									transition={{ delay: 0.35, duration: 0.4 }}
									sx={{ flex: 1 }}
								>
									<StyledCard
										variant="default"
										sx={{
											p: 3,
											height: "100%",
											border: `1px solid ${alpha("#f59e0b", 0.3)}`,
											background: alpha("#f59e0b", 0.02),
											display: "flex",
											flexDirection: "column",
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 2,
												mb: 2,
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
													background: alpha("#f59e0b", 0.15),
													border: `1px solid ${alpha("#f59e0b", 0.3)}`,
												}}
											>
												<RestartAltIcon
													sx={{ fontSize: 24, color: "#f59e0b" }}
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
													{t("reset_statistics_title") || "Reset Statistics"}
												</Typography>
												<Typography
													variant="body2"
													sx={{
														color: "text.cardSubtitle",
														fontFamily: "Inter, sans-serif",
													}}
												>
													{t("reset_statistics_message") ||
														"Reset all card statistics and delete study sessions."}
												</Typography>
											</Box>
										</Box>
										<Box sx={{ mt: "auto" }}>
											<StyledButton
												variant="warning"
												onClick={() => setResetModalOpen(true)}
												startIcon={<RestartAltIcon sx={{ fontSize: 20 }} />}
											>
												{t("reset_statistics") || "Reset Statistics"}
											</StyledButton>
										</Box>
									</StyledCard>
								</MotionBox>

								{/* Delete Account */}
								<MotionBox
									initial={{ y: 20 }}
									animate={{ y: 0 }}
									transition={{ delay: 0.4, duration: 0.4 }}
									sx={{ flex: 1 }}
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
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 2,
												mb: 2,
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
							{/* End Right Column */}
						</Box>
						{/* End Grid */}
					</>
				)}
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

			{/* Reset Statistics Confirmation Modal */}
			<ConfirmModal
				open={resetModalOpen}
				onClose={() => setResetModalOpen(false)}
				onConfirm={handleResetStatistics}
				title={t("reset_statistics_title") || "Reset Statistics"}
				message={
					t("reset_statistics_confirm") ||
					"Are you sure you want to reset all statistics? This action cannot be undone."
				}
				confirmText={
					resetLoading
						? t("resetting") || "Resetting..."
						: t("reset") || "Reset"
				}
				cancelText={t("cancel")}
				variant="warning"
				icon={RestartAltIcon}
				loading={resetLoading}
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
