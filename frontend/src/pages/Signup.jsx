import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { signUp, signInWithGoogle } from "../services/authServices";
import { I18nContext } from "../utils/i18n";
import { useSEO } from "../utils/seo";
import { Box, Typography, Alert, Link, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import GoogleIcon from "@mui/icons-material/Google";
import { StyledButton, StyledTextField, StyledCard } from "../components/ui";

const MotionBox = motion.create(Box);

export default function Signup({ onSignup, onSwitch }) {
	const { t } = useContext(I18nContext);

	// SEO meta tags for signup page
	useSEO("signup");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (password !== confirmPassword) {
			setError(t("passwords_dont_match") || "Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError(
				t("password_too_short") || "Password must be at least 8 characters.",
			);
			return;
		}

		setLoading(true);
		try {
			await signUp(email, password);
			setSuccess(true);
			// Don't auto-redirect - user needs to verify email first
		} catch (err) {
			console.error("Signup error:", err);
			const errorCode = err.code;

			if (errorCode === "auth/email-already-in-use") {
				setError(t("email_exists") || "Email is already in use");
			} else if (errorCode === "auth/invalid-email") {
				setError(t("invalid_email") || "Invalid email address");
			} else if (errorCode === "auth/weak-password") {
				setError(
					t("weak_password") ||
						"Password is too weak. Use at least 6 characters.",
				);
			} else if (errorCode === "auth/operation-not-allowed") {
				setError(t("signup_disabled") || "Sign up is currently disabled");
			} else {
				setError(err.message || t("signup_failed") || "Sign up failed");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setError("");
		setGoogleLoading(true);
		try {
			await signInWithGoogle();
			onSignup && onSignup();
		} catch (err) {
			console.error("Google sign-in error:", err);
			if (err.code === "auth/popup-closed-by-user") {
				return;
			}
			setError(
				t("google_signin_failed") || "Google sign-in failed. Please try again.",
			);
		} finally {
			setGoogleLoading(false);
		}
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
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Background decorative elements */}
			<Box
				sx={{
					position: "absolute",
					top: "-10%",
					left: "-10%",
					width: "500px",
					height: "500px",
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
					pointerEvents: "none",
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					bottom: "-20%",
					right: "-10%",
					width: "600px",
					height: "600px",
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)",
					pointerEvents: "none",
				}}
			/>

			<MotionBox
				initial={{ y: 20 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				sx={{
					width: "100%",
					maxWidth: 440,
					position: "relative",
					zIndex: 1,
				}}
			>
				<StyledCard
					variant="elevated"
					hover={false}
					sx={{
						p: { xs: 3, sm: 4 },
					}}
				>
					{/* Logo */}
					<MotionBox
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 2,
							mb: 4,
						}}
					>
						<Box
							component="img"
							src="/images/logo/memodeck.png"
							alt="MemoDeck"
							sx={{
								width: 52,
								height: 52,
								borderRadius: "14px",
								objectFit: "cover",
								boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
							}}
						/>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 700,
								background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
								backgroundClip: "text",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								fontFamily: "Inter, sans-serif",
							}}
						>
							MemoDeck
						</Typography>
					</MotionBox>

					{success ? (
						<MotionBox
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								textAlign: "center",
								py: 4,
							}}
						>
							<MotionBox
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									type: "spring",
									stiffness: 200,
									damping: 15,
									delay: 0.1,
								}}
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
							</MotionBox>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 600,
									color: "text.cardTitle",
									mb: 1,
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("verify_your_email") || "Verify Your Email"}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: "text.cardSubtitle",
									fontFamily: "Inter, sans-serif",
									mb: 3,
								}}
							>
								{t("verification_email_sent_desc") ||
									"We've sent a verification link to your email. Please check your inbox and click the link to activate your account."}
							</Typography>
							<StyledButton variant="outlined" onClick={onSwitch}>
								{t("go_to_login") || "Go to Login"}
							</StyledButton>
						</MotionBox>
					) : (
						<>
							<Typography
								variant="h5"
								sx={{
									fontWeight: 700,
									color: "text.cardTitle",
									mb: 1,
									textAlign: "center",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("create_account") || "Create an account"}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: "text.cardSubtitle",
									mb: 4,
									textAlign: "center",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("signup_subtitle") ||
									"Start mastering anything with flashcards"}
							</Typography>

							{/* Google Sign-In Button */}
							<StyledButton
								variant="outlined"
								size="large"
								fullWidth
								loading={googleLoading}
								onClick={handleGoogleSignIn}
								disabled={loading}
								sx={{
									mb: 3,
									borderColor: "divider",
									color: "text.primary",
									"&:hover": {
										borderColor: "primary.main",
										backgroundColor: "action.hover",
									},
								}}
								startIcon={<GoogleIcon sx={{ color: "#4285F4" }} />}
							>
								{t("continue_with_google") || "Continue with Google"}
							</StyledButton>

							<Divider sx={{ mb: 3 }}>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary", px: 2 }}
								>
									{t("or") || "or"}
								</Typography>
							</Divider>

							<Box
								component="form"
								onSubmit={handleSubmit}
								sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
							>
								<StyledTextField
									label={t("email") || "Email"}
									type="email"
									variant="outlined"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									fullWidth
									autoComplete="email"
								/>

								<StyledTextField
									label={t("password") || "Password"}
									type="password"
									variant="outlined"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									fullWidth
									autoComplete="new-password"
									helperText={
										t("password_rule_helper_text") || "At least 8 characters"
									}
								/>

								<StyledTextField
									label={t("confirm_password") || "Confirm Password"}
									type="password"
									variant="outlined"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									fullWidth
									autoComplete="new-password"
								/>

								{error && (
									<MotionBox initial={{ y: -10 }} animate={{ y: 0 }}>
										<Alert
											severity="error"
											sx={{
												borderRadius: "12px",
												fontFamily: "Inter, sans-serif",
											}}
										>
											{error}
										</Alert>
									</MotionBox>
								)}

								<StyledButton
									type="submit"
									variant="primary"
									size="large"
									fullWidth
									loading={loading}
									disabled={googleLoading}
									sx={{ mt: 1 }}
								>
									{t("signup") || "Create Account"}
								</StyledButton>
							</Box>

							<Box
								sx={{
									mt: 4,
									pt: 3,
									borderTop: (theme) => `1px solid ${theme.palette.divider}`,
									textAlign: "center",
								}}
							>
								<Typography
									variant="body2"
									sx={{
										color: "text.cardSubtitle",
										fontFamily: "Inter, sans-serif",
									}}
								>
									{t("have_account") || "Already have an account?"}{" "}
									<Link
										component="button"
										variant="body2"
										onClick={onSwitch}
										underline="none"
										sx={{
											color: "primary.light",
											fontWeight: 600,
											cursor: "pointer",
											transition: "color 0.2s",
											"&:hover": {
												color: "primary.main",
											},
											verticalAlign: "unset",
										}}
									>
										{t("login") || "Sign in"}
									</Link>
								</Typography>
							</Box>
						</>
					)}
				</StyledCard>
			</MotionBox>
		</Box>
	);
}
