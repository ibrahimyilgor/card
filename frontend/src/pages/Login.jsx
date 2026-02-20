import React, { useState, useContext, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle } from "../services/authServices";
import { I18nContext } from "../utils/i18n";
import { useSEO } from "../utils/seo";
import { Box, Typography, Alert, IconButton } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { StyledButton, StyledCard } from "../components/ui";

const MotionBox = motion.create(Box);

// Placeholder slide data — drop your screenshots into /images/screenshots/
// and name them screenshot-1.png, screenshot-2.png, …
// Slides use i18n keys for titles/descriptions/labels. Provide translation
// strings in your locale files (e.g. `en.json`, `tr.json`) using these keys.
const SLIDES = [
	{
		src: "/images/screenshots/screenshot-1.png",
		labelKey: "slide1.label",
		titleKey: "slide1.title",
		descKey: "slide1.description",
	},
	{
		src: "/images/screenshots/screenshot-2.png",
		labelKey: "slide2.label",
		titleKey: "slide2.title",
		descKey: "slide2.description",
	},
	{
		src: "/images/screenshots/screenshot-3.png",
		labelKey: "slide3.label",
		titleKey: "slide3.title",
		descKey: "slide3.description",
	},
	{
		src: "/images/screenshots/screenshot-4.png",
		labelKey: "slide4.label",
		titleKey: "slide4.title",
		descKey: "slide4.description",
	},
	{
		src: "/images/screenshots/screenshot-5.png",
		labelKey: "slide5.label",
		titleKey: "slide5.title",
		descKey: "slide5.description",
	},
	{
		src: "/images/screenshots/screenshot-6.png",
		labelKey: "slide6.label",
		titleKey: "slide6.title",
		descKey: "slide6.description",
	},
];

const AUTO_PLAY_INTERVAL = 4500; // ms

const slideVariants = {
	enter: (dir) => ({
		x: dir > 0 ? "100%" : "-100%",
		opacity: 0,
		scale: 0.97,
	}),
	center: {
		x: 0,
		opacity: 1,
		scale: 1,
		transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
	},
	exit: (dir) => ({
		x: dir > 0 ? "-100%" : "100%",
		opacity: 0,
		scale: 0.97,
		transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
	}),
};

// Gradient placeholders shown when image hasn't loaded yet
const PLACEHOLDER_GRADIENTS = [
	"linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a4a7a 100%)",
	"linear-gradient(135deg, #2d1b69 0%, #6b3fa0 50%, #3d2080 100%)",
	"linear-gradient(135deg, #0d3b2e 0%, #1a6b4a 50%, #0a4f38 100%)",
	"linear-gradient(135deg, #3b1f0d 0%, #8b4a1a 50%, #5c2e0a 100%)",
	"linear-gradient(135deg, #1a0d3b 0%, #4a1a8b 50%, #2d0f5c 100%)",
];

const captionVariants = {
	enter: (dir) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
	center: {
		x: 0,
		opacity: 1,
		transition: { duration: 0.4, ease: "easeOut", delay: 0.15 },
	},
	exit: (dir) => ({
		x: dir > 0 ? -24 : 24,
		opacity: 0,
		transition: { duration: 0.25, ease: "easeIn" },
	}),
};

function ScreenshotCarousel() {
	const { t } = useContext(I18nContext);
	const [current, setCurrent] = useState(0);
	const [direction, setDirection] = useState(1);
	const [paused, setPaused] = useState(false);
	const [imageStates, setImageStates] = useState(
		() => SLIDES.map(() => "loading"), // "loading" | "loaded" | "error"
	);

	const goTo = useCallback((index, dir) => {
		setDirection(dir);
		setCurrent((index + SLIDES.length) % SLIDES.length);
	}, []);

	const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
	const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

	useEffect(() => {
		if (paused) return;
		const id = setInterval(() => {
			setDirection(1);
			setCurrent((c) => (c + 1) % SLIDES.length);
		}, AUTO_PLAY_INTERVAL);
		return () => clearInterval(id);
	}, [paused]);

	const handleImageLoad = (idx) => {
		setImageStates((prev) => {
			const next = [...prev];
			next[idx] = "loaded";
			return next;
		});
	};

	const handleImageError = (idx) => {
		setImageStates((prev) => {
			const next = [...prev];
			next[idx] = "error";
			return next;
		});
	};

	return (
		<Box
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			sx={{
				position: "relative",
				width: "100%",
				aspectRatio: "1382 / 921",
				maxWidth: "100%",
				borderRadius: "20px",
				overflow: "hidden",
				boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
				userSelect: "none",
			}}
		>
			{/* Slides */}
			<AnimatePresence initial={false} custom={direction}>
				<MotionBox
					key={current}
					custom={direction}
					variants={slideVariants}
					initial="enter"
					animate="center"
					exit="exit"
					sx={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
					}}
				>
					{/* Placeholder gradient (always rendered, hidden when image loaded) */}
					<Box
						sx={{
							position: "absolute",
							inset: 0,
							background:
								PLACEHOLDER_GRADIENTS[current % PLACEHOLDER_GRADIENTS.length],
							display: imageStates[current] === "loaded" ? "none" : "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
							gap: 2,
						}}
					>
						{imageStates[current] === "loading" && (
							<>
								{/* Animated shimmer bars */}
								{[70, 50, 60].map((w, i) => (
									<Box
										key={i}
										sx={{
											width: `${w}%`,
											height: 12,
											borderRadius: 6,
											background:
												"linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 75%)",
											backgroundSize: "200% 100%",
											animation: "shimmer 1.6s infinite",
											"@keyframes shimmer": {
												"0%": { backgroundPosition: "-200% 0" },
												"100%": { backgroundPosition: "200% 0" },
											},
										}}
									/>
								))}
							</>
						)}
					</Box>

					{/* Actual screenshot image */}
					<Box
						component="img"
						src={SLIDES[current].src}
						alt={t(SLIDES[current].labelKey) || ""}
						onLoad={() => handleImageLoad(current)}
						onError={() => handleImageError(current)}
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							objectFit: "fill",
							objectPosition: "center center",
							opacity: imageStates[current] === "loaded" ? 1 : 0,
							transition: "opacity 0.4s ease",
						}}
					/>

					{/* Bottom gradient overlay — taller to accommodate caption */}
					<Box
						sx={{
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							height: "50%",
							background:
								"linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
							pointerEvents: "none",
						}}
					/>

					{/* Animated caption overlay */}
					<AnimatePresence initial={false} custom={direction} mode="wait">
						<MotionBox
							key={`caption-${current}`}
							custom={direction}
							variants={captionVariants}
							initial="enter"
							animate="center"
							exit="exit"
							sx={{
								position: "absolute",
								bottom: 44,
								left: 0,
								right: 0,
								px: 3,
								zIndex: 5,
							}}
						>
							<Typography
								variant="subtitle1"
								sx={{
									color: "#fff",
									fontWeight: 700,
									fontFamily: "Inter, sans-serif",
									fontSize: "1.05rem",
									lineHeight: 1.35,
									mb: 0.75,
									textShadow: "0 1px 6px rgba(0,0,0,0.5)",
								}}
							>
								{t(SLIDES[current].titleKey) || ""}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: "rgba(255,255,255,0.82)",
									fontFamily: "Inter, sans-serif",
									lineHeight: 1.55,
									fontSize: "0.82rem",
									textShadow: "0 1px 4px rgba(0,0,0,0.4)",
								}}
							>
								{t(SLIDES[current].descKey) || ""}
							</Typography>
						</MotionBox>
					</AnimatePresence>
				</MotionBox>
			</AnimatePresence>

			{/* Prev / Next arrow buttons */}
			<IconButton
				onClick={prev}
				size="small"
				sx={{
					position: "absolute",
					left: 12,
					top: "50%",
					transform: "translateY(-50%)",
					zIndex: 10,
					bgcolor: "rgba(0,0,0,0.45)",
					backdropFilter: "blur(8px)",
					color: "#fff",
					"&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
					transition: "background 0.2s",
				}}
			>
				<ChevronLeftIcon />
			</IconButton>
			<IconButton
				onClick={next}
				size="small"
				sx={{
					position: "absolute",
					right: 12,
					top: "50%",
					transform: "translateY(-50%)",
					zIndex: 10,
					bgcolor: "rgba(0,0,0,0.45)",
					backdropFilter: "blur(8px)",
					color: "#fff",
					"&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
					transition: "background 0.2s",
				}}
			>
				<ChevronRightIcon />
			</IconButton>

			{/* Dot indicators */}
			<Box
				sx={{
					position: "absolute",
					bottom: 16,
					left: "50%",
					transform: "translateX(-50%)",
					display: "flex",
					gap: 1,
					zIndex: 10,
				}}
			>
				{SLIDES.map((_, idx) => (
					<Box
						key={idx}
						onClick={() => goTo(idx, idx > current ? 1 : -1)}
						sx={{
							width: idx === current ? 22 : 7,
							height: 7,
							borderRadius: 4,
							bgcolor: idx === current ? "#fff" : "rgba(255,255,255,0.4)",
							cursor: "pointer",
							transition: "all 0.3s ease",
							"&:hover": {
								bgcolor: idx === current ? "#fff" : "rgba(255,255,255,0.65)",
							},
						}}
					/>
				))}
			</Box>

			{/* Progress bar */}
			{!paused && (
				<Box
					key={`progress-${current}`}
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						height: 3,
						bgcolor: "rgba(59, 130, 246, 0.9)",
						borderRadius: "0 2px 2px 0",
						animation: `progress ${AUTO_PLAY_INTERVAL}ms linear`,
						"@keyframes progress": {
							from: { width: "0%" },
							to: { width: "100%" },
						},
						zIndex: 10,
					}}
				/>
			)}
		</Box>
	);
}

export default function Login({ onLogin }) {
	const [error, setError] = useState("");
	const [googleLoading, setGoogleLoading] = useState(false);
	const { t } = useContext(I18nContext);

	useSEO("login");

	const handleGoogleSignIn = async () => {
		setError("");
		setGoogleLoading(true);
		try {
			await signInWithGoogle();
			onLogin();
		} catch (err) {
			console.error("Google sign-in error:", err);
			if (err.code === "auth/popup-closed-by-user") return;
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
			{/* Background blobs */}
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
					maxWidth: 1160,
					gap: { xs: 0, md: 6 },
					alignItems: "stretch",
					position: "relative",
					zIndex: 1,
					minHeight: { md: 560 },
				}}
			>
				{/* ── Left: Screenshot Carousel ── */}
				<MotionBox
					initial={{ x: -40, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.65, ease: "easeOut" }}
					sx={{
						flex: 1.15,
						display: { xs: "none", md: "flex" },
						flexDirection: "column",
						gap: 3,
					}}
				>
					{/* Brand header above carousel */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<Box
							component="img"
							src="/images/logo/memodeck.png"
							alt="MemoDeck"
							sx={{
								width: 36,
								height: 36,
								borderRadius: "9px",
								objectFit: "cover",
								boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
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
						<Typography
							variant="body2"
							sx={{
								color: "text.cardSubtitle",
								fontFamily: "Inter, sans-serif",
								ml: 0.5,
								mt: 0.3,
							}}
						>
							{t("tagline") || "Master anything with flashcards"}
						</Typography>
					</Box>

					{/* Carousel */}
					<Box sx={{ flex: 1, minHeight: 0 }}>
						<ScreenshotCarousel />
					</Box>
				</MotionBox>

				{/* ── Right: Login Card ── */}
				<MotionBox
					initial={{ x: 40, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
					sx={{
						flex: 1,
						display: "flex",
						alignItems: "center",
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
						{/* Mobile branding */}
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
									sx={{ borderRadius: "12px", fontFamily: "Inter, sans-serif" }}
								>
									{error}
								</Alert>
							</MotionBox>
						)}

						<StyledButton
							variant="primary"
							size="large"
							fullWidth
							loading={googleLoading}
							onClick={handleGoogleSignIn}
							sx={{ py: 1.5, fontSize: "1rem" }}
							startIcon={<GoogleIcon />}
						>
							{t("continue_with_google") || "Continue with Google"}
						</StyledButton>
					</StyledCard>
				</MotionBox>
			</Box>
		</Box>
	);
}
