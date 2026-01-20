import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
	sendVerificationEmail,
	reloadUser,
	signOut,
} from "../services/authServices";
import { firebaseAuth } from "../config/firebase";
import { I18nContext } from "../utils/i18n";
import { Box, Typography, Alert } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { StyledButton, StyledCard } from "../components/ui";

const MotionBox = motion.create(Box);

export default function VerifyEmail({ onVerified, onBack }) {
	const { t } = useContext(I18nContext);
	const [loading, setLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [verified, setVerified] = useState(false);
	const [email, setEmail] = useState("");

	useEffect(() => {
		const user = firebaseAuth.getCurrentUser();
		if (user) {
			setEmail(user.email);
			if (user.emailVerified) {
				setVerified(true);
			}
		}
	}, []);

	// Poll for verification status
	useEffect(() => {
		if (verified) return;

		const interval = setInterval(async () => {
			try {
				const user = await reloadUser();
				if (user?.emailVerified) {
					setVerified(true);
					clearInterval(interval);
				}
			} catch (err) {
				// Ignore errors during polling
			}
		}, 3000); // Check every 3 seconds

		return () => clearInterval(interval);
	}, [verified]);

	const handleResendEmail = async () => {
		setResendLoading(true);
		setError("");
		setSuccess("");
		try {
			await sendVerificationEmail();
			setSuccess(
				t("verification_email_sent") ||
					"Verification email sent! Please check your inbox.",
			);
		} catch (err) {
			console.error("Resend error:", err);
			if (err.code === "auth/too-many-requests") {
				setError(
					t("too_many_requests") ||
						"Too many requests. Please wait a moment and try again.",
				);
			} else {
				setError(
					t("verification_email_failed") || "Failed to send verification email",
				);
			}
		} finally {
			setResendLoading(false);
		}
	};

	const handleCheckVerification = async () => {
		setLoading(true);
		setError("");
		try {
			const user = await reloadUser();
			if (user?.emailVerified) {
				setVerified(true);
			} else {
				setError(
					t("email_not_verified_yet") ||
						"Email not verified yet. Please check your inbox.",
				);
			}
		} catch (err) {
			setError(
				t("verification_check_failed") || "Failed to check verification status",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleContinue = () => {
		onVerified && onVerified();
	};

	const handleSignOut = async () => {
		await signOut();
		onBack && onBack();
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				width: "100%",
				background: (theme) =>
					`linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.background.default} 100%)`,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				p: { xs: 2, sm: 4 },
			}}
		>
			<MotionBox
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				sx={{ width: "100%", maxWidth: 440 }}
			>
				<StyledCard
					variant="elevated"
					hover={false}
					sx={{ p: { xs: 3, sm: 4 } }}
				>
					{verified ? (
						// Verified state
						<MotionBox
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								textAlign: "center",
								py: 2,
							}}
						>
							<MotionBox
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", stiffness: 200, damping: 15 }}
								sx={{
									width: 80,
									height: 80,
									borderRadius: "50%",
									background:
										"linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									mb: 3,
								}}
							>
								<CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
							</MotionBox>
							<Typography
								variant="h6"
								sx={{ fontWeight: 600, color: "text.cardTitle", mb: 1 }}
							>
								{t("email_verified") || "Email Verified!"}
							</Typography>
							<Typography
								variant="body2"
								sx={{ color: "text.cardSubtitle", mb: 3 }}
							>
								{t("email_verified_desc") ||
									"Your email has been verified. You can now continue to the app."}
							</Typography>
							<StyledButton
								variant="primary"
								size="large"
								fullWidth
								onClick={handleContinue}
							>
								{t("continue") || "Continue"}
							</StyledButton>
						</MotionBox>
					) : (
						// Waiting for verification
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								textAlign: "center",
								py: 2,
							}}
						>
							<Box
								sx={{
									width: 80,
									height: 80,
									borderRadius: "50%",
									background:
										"linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									mb: 3,
								}}
							>
								<MailOutlineIcon sx={{ fontSize: 40, color: "primary.main" }} />
							</Box>

							<Typography
								variant="h6"
								sx={{ fontWeight: 600, color: "text.cardTitle", mb: 1 }}
							>
								{t("verify_your_email") || "Verify Your Email"}
							</Typography>

							<Typography
								variant="body2"
								sx={{ color: "text.cardSubtitle", mb: 1 }}
							>
								{t("verification_sent_to") ||
									"We've sent a verification link to:"}
							</Typography>

							<Typography
								variant="body1"
								sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}
							>
								{email}
							</Typography>

							<Typography
								variant="body2"
								sx={{ color: "text.cardSubtitle", mb: 3 }}
							>
								{t("click_link_to_verify") ||
									"Click the link in the email to verify your account."}
							</Typography>

							{error && (
								<Alert
									severity="error"
									sx={{ width: "100%", mb: 2, borderRadius: "12px" }}
								>
									{error}
								</Alert>
							)}

							{success && (
								<Alert
									severity="success"
									sx={{ width: "100%", mb: 2, borderRadius: "12px" }}
								>
									{success}
								</Alert>
							)}

							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: 2,
									width: "100%",
								}}
							>
								<StyledButton
									variant="primary"
									size="large"
									fullWidth
									loading={loading}
									onClick={handleCheckVerification}
								>
									{t("i_verified_my_email") || "I've Verified My Email"}
								</StyledButton>

								<StyledButton
									variant="outlined"
									size="large"
									fullWidth
									loading={resendLoading}
									onClick={handleResendEmail}
								>
									{t("resend_verification") || "Resend Verification Email"}
								</StyledButton>

								<StyledButton
									variant="text"
									size="small"
									onClick={handleSignOut}
									sx={{ mt: 1 }}
								>
									{t("use_different_email") || "Use a different email"}
								</StyledButton>
							</Box>
						</Box>
					)}
				</StyledCard>
			</MotionBox>
		</Box>
	);
}
