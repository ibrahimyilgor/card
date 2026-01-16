import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { login } from "../services/authServices";
import { I18nContext } from "../utils/i18n";
import { useSEO } from "../utils/seo";
import { Box, Typography, Alert, Link } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import BuildIcon from "@mui/icons-material/Build";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { StyledButton, StyledTextField, StyledCard } from "../components/ui";

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

export default function Login({ onLogin, onSwitch }) {
	const [accountname, setAccountname] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { t } = useContext(I18nContext);

	// SEO meta tags for login page
	useSEO('login');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const res = await login(accountname, password);
			const data = res.data;
			if (res.status === 200 && data.token) {
				localStorage.setItem("token", data.token);
				if (data.refreshToken) {
					localStorage.setItem("refreshToken", data.refreshToken);
				}
				if (data.accountId) {
					localStorage.setItem("accountId", data.accountId);
				}
				onLogin();
			} else {
				setError(data.error || t("login_failed"));
			}
		} catch (err) {
			if (err.response?.data?.error) {
				const errorKey = err.response.data.error;
				if (errorKey === "Invalid credentials") {
					setError(t("invalid_credentials"));
				} else {
					setError(errorKey);
				}
			} else {
				setError(t("network_error"));
			}
		} finally {
			setLoading(false);
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
								fontFamily: "Inter, sans-serif",
							}}
						>
							{t("welcome_back") || "Welcome back"}
						</Typography>
						<Typography
							variant="body2"
							sx={{
								color: "text.cardSubtitle",
								mb: 4,
								fontFamily: "Inter, sans-serif",
							}}
						>
							{t("login_subtitle") || "Enter your credentials to continue"}
						</Typography>

						<Box
							component="form"
							onSubmit={handleSubmit}
							sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
						>
							<StyledTextField
								label={t("email") || "Email"}
								variant="outlined"
								value={accountname}
								onChange={(e) => setAccountname(e.target.value)}
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
								autoComplete="current-password"
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
								sx={{ mt: 1 }}
							>
								{t("login") || "Sign In"}
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
								{t("no_account") || "Don't have an account?"}{" "}
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
									{t("signup") || "Create account"}
								</Link>
							</Typography>
						</Box>
					</StyledCard>
				</MotionBox>
			</Box>
		</Box>
	);
}
