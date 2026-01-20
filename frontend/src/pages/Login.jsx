import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { signInWithGoogle } from "../services/authServices";
import { I18nContext } from "../utils/i18n";
import { useSEO } from "../utils/seo";
import { Box, Typography, Alert } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import BuildIcon from "@mui/icons-material/Build";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GoogleIcon from "@mui/icons-material/Google";
import { StyledButton, StyledCard } from "../components/ui";

const MotionBox = motion.create(Box);

// Feature item component with animation
const FeatureItem = ({ icon: Icon, title, description, delay }) => (
	<MotionBox
		initial={{ x: -20 }}
		animate={{ x: 0 }}
		transition={{ duration: 0.5, delay }}
		sx={{
			display: "flex",
			alignItems: "flex-start",
			gap: 2.5,
			mb: 3,
		}}
	>
		<Box
			sx={{
				width: 44,
				height: 44,
				borderRadius: "12px",
				background:
					"linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
			}}
		>
			<Icon sx={{ color: "primary.light", fontSize: 22 }} />
		</Box>
		<Box>
			<Typography
				variant="subtitle1"
				sx={{
					fontWeight: 600,
					color: "text.cardTitle",
					mb: 0.5,
					fontFamily: "Inter, sans-serif",
				}}
			>
				{title}
			</Typography>
			<Typography
				variant="body2"
				sx={{
					color: "text.cardSubtitle",
					lineHeight: 1.6,
					fontFamily: "Inter, sans-serif",
				}}
			>
				{description}
			</Typography>
		</Box>
	</MotionBox>
);

export default function Login({ onLogin }) {
	const [error, setError] = useState("");
	const [googleLoading, setGoogleLoading] = useState(false);
	const { t } = useContext(I18nContext);

	// SEO meta tags for login page
	useSEO("login");

	const handleGoogleSignIn = async () => {
		setError("");
		setGoogleLoading(true);
		try {
			await signInWithGoogle();
			onLogin();
		} catch (err) {
			console.error("Google sign-in error:", err);
			if (err.code === "auth/popup-closed-by-user") {
				// User closed popup, don't show error
				return;
			}
			setError(
				t("google_signin_failed") || "Google sign-in failed. Please try again.",
			);
		} finally {
			setGoogleLoading(false);
		}
	};

	const features = [
		{
			icon: BoltIcon,
			title: t("adaptable_performance"),
			description: t("adaptable_performance_desc"),
		},
		{
			icon: BuildIcon,
			title: t("built_to_last"),
			description: t("built_to_last_desc"),
		},
		{
			icon: ThumbUpAltIcon,
			title: t("great_account_experience"),
			description: t("great_account_experience_desc"),
		},
		{
			icon: AutoAwesomeIcon,
			title: t("innovative_functionality"),
			description: t("innovative_functionality_desc"),
		},
	];

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
					top: "-20%",
					right: "-10%",
					width: "600px",
					height: "600px",
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
					pointerEvents: "none",
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					bottom: "-30%",
					left: "-15%",
					width: "800px",
					height: "800px",
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
					pointerEvents: "none",
				}}
			/>

			<Box
				sx={{
					display: "flex",
					width: "100%",
					maxWidth: 1100,
					gap: { xs: 0, md: 8 },
					alignItems: "center",
					position: "relative",
					zIndex: 1,
				}}
			>
				{/* Left Info Panel */}
				<MotionBox
					initial={{ x: -40 }}
					animate={{ x: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					sx={{
						flex: 1,
						display: { xs: "none", md: "flex" },
						flexDirection: "column",
						pr: 4,
					}}
				>
					{/* Logo/Brand */}
					<MotionBox
						initial={{ y: -20 }}
						animate={{ y: 0 }}
						transition={{ duration: 0.5 }}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 2,
							mb: 5,
						}}
					>
						<Box
							component="img"
							src="/images/logo/memodeck.png"
							alt="MemoDeck"
							sx={{
								width: 40,
								height: 40,
								borderRadius: "10px",
								objectFit: "cover",
								boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
							}}
						/>
						<Box>
							<Typography
								variant="h4"
								sx={{
									fontWeight: 700,
									background:
										"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
									backgroundClip: "text",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									fontFamily: "Inter, sans-serif",
								}}
							>
								MemoDeck
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: "text.cardSubtitle",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("tagline") || "Master anything with flashcards"}
							</Typography>
						</Box>
					</MotionBox>

					{/* Features */}
					<Box sx={{ mt: 2 }}>
						{features.map((feature, index) => (
							<FeatureItem
								key={index}
								icon={feature.icon}
								title={feature.title}
								description={feature.description}
								delay={0.2 + index * 0.1}
							/>
						))}
					</Box>
				</MotionBox>

				{/* Right Login Form */}
				<MotionBox
					initial={{ x: 40 }}
					animate={{ x: 0 }}
					transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
					sx={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
						width: "100%",
					}}
				>
					<StyledCard
						variant="elevated"
						hover={false}
						sx={{
							width: "100%",
							maxWidth: 420,
							p: { xs: 3, sm: 4 },
						}}
					>
						{/* Mobile Logo */}
						<Box
							sx={{
								display: { xs: "flex", md: "none" },
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
									width: 48,
									height: 48,
									borderRadius: "14px",
									objectFit: "cover",
								}}
							/>
							<Typography
								variant="h5"
								sx={{
									fontWeight: 700,
									background:
										"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
									backgroundClip: "text",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								MemoDeck
							</Typography>
						</Box>

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
							{t("welcome_to_memodeck") || "Welcome to MemoDeck"}
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
							{t("signin_with_google_desc") ||
								"Sign in with your Google account to continue"}
						</Typography>

						{error && (
							<MotionBox initial={{ y: -10 }} animate={{ y: 0 }} sx={{ mb: 3 }}>
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

						{/* Google Sign-In Button */}
						<StyledButton
							variant="primary"
							size="large"
							fullWidth
							loading={googleLoading}
							onClick={handleGoogleSignIn}
							sx={{
								py: 1.5,
								fontSize: "1rem",
							}}
							startIcon={<GoogleIcon />}
						>
							{t("continue_with_google") || "Continue with Google"}
						</StyledButton>

						{/* <Typography
							variant="caption"
							sx={{
								color: "text.cardSubtitle",
								textAlign: "center",
								display: "block",
								mt: 3,
								fontFamily: "Inter, sans-serif",
							}}
						>
							{t("terms_agreement") ||
								"By continuing, you agree to our Terms of Service and Privacy Policy"}
						</Typography> */}
					</StyledCard>
				</MotionBox>
			</Box>
		</Box>
	);
}
