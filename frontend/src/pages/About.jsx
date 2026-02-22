import React, { useContext } from "react";
import {
	Box,
	Typography,
	useTheme,
	alpha,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StyleIcon from "@mui/icons-material/Style";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TranslateIcon from "@mui/icons-material/Translate";
import DevicesIcon from "@mui/icons-material/Devices";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolIcon from "@mui/icons-material/School";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TuneIcon from "@mui/icons-material/Tune";
import { I18nContext } from "../utils/i18n";
import { useSEO } from "../utils/seo";

const MotionBox = motion.create(Box);

function FeatureCard({ icon: Icon, title, description, color, delay }) {
	const theme = useTheme();

	return (
		<MotionBox
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.4 }}
			sx={{
				p: 3,
				borderRadius: "16px",
				background:
					theme.palette.mode === "dark"
						? "rgba(30, 41, 59, 0.6)"
						: "rgba(255, 255, 255, 0.8)",
				border: `1px solid ${
					theme.palette.mode === "dark"
						? "rgba(255, 255, 255, 0.08)"
						: "rgba(0, 0, 0, 0.06)"
				}`,
				transition: "transform 0.2s ease, box-shadow 0.2s ease",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
				},
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
					background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.05)} 100%)`,
					border: `1px solid ${alpha(color, 0.3)}`,
					mb: 2,
				}}
			>
				<Icon sx={{ fontSize: 24, color }} />
			</Box>
			<Typography
				variant="h6"
				sx={{
					fontWeight: 700,
					color: "text.primary",
					fontFamily: "Inter, sans-serif",
					fontSize: "1rem",
					mb: 1,
				}}
			>
				{title}
			</Typography>
			<Typography
				variant="body2"
				sx={{
					color: "text.secondary",
					fontFamily: "Inter, sans-serif",
					lineHeight: 1.7,
				}}
			>
				{description}
			</Typography>
		</MotionBox>
	);
}

function StepCard({ number, title, description, delay }) {
	const theme = useTheme();

	return (
		<MotionBox
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay, duration: 0.4 }}
			sx={{
				display: "flex",
				gap: 2.5,
				alignItems: "flex-start",
			}}
		>
			<Box
				sx={{
					width: 40,
					height: 40,
					borderRadius: "10px",
					background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
				}}
			>
				<Typography
					sx={{
						color: "#fff",
						fontWeight: 800,
						fontFamily: "Inter, sans-serif",
						fontSize: "1rem",
					}}
				>
					{number}
				</Typography>
			</Box>
			<Box>
				<Typography
					variant="subtitle1"
					sx={{
						fontWeight: 700,
						color: "text.primary",
						fontFamily: "Inter, sans-serif",
						mb: 0.5,
					}}
				>
					{title}
				</Typography>
				<Typography
					variant="body2"
					sx={{
						color: "text.secondary",
						fontFamily: "Inter, sans-serif",
						lineHeight: 1.7,
					}}
				>
					{description}
				</Typography>
			</Box>
		</MotionBox>
	);
}

export default function About() {
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	useSEO("about");

	const features = [
		{
			icon: StyleIcon,
			title: t("about_feature_decks_title") || "Custom Flashcard Decks",
			description:
				t("about_feature_decks_desc") ||
				"Create unlimited flashcard decks on any topic. Add front and back text, organize your study materials, and import decks from files.",
			color: "#3b82f6",
		},
		{
			icon: SportsEsportsIcon,
			title: t("about_feature_modes_title") || "Multiple Game Modes",
			description:
				t("about_feature_modes_desc") ||
				"Study with Standard, Write, Multiple Choice, and Match modes. Add challenge types like Timed or Survival for extra excitement.",
			color: "#8b5cf6",
		},
		{
			icon: BarChartIcon,
			title: t("about_feature_stats_title") || "Detailed Statistics",
			description:
				t("about_feature_stats_desc") ||
				"Track your learning progress with charts, heatmaps, streak tracking, and per-deck accuracy analytics to identify strengths and weaknesses.",
			color: "#22c55e",
		},
		{
			icon: EmojiEventsIcon,
			title: t("about_feature_achievements_title") || "Achievement System",
			description:
				t("about_feature_achievements_desc") ||
				"Earn badges for streak milestones, study volume, and accuracy goals. Stay motivated with visible progress and rewards.",
			color: "#f59e0b",
		},
		{
			icon: TranslateIcon,
			title: t("about_feature_i18n_title") || "Multi-Language Support",
			description:
				t("about_feature_i18n_desc") ||
				"Use MemoDeck in English or Turkish. The entire interface, including game modes and statistics, adapts to your preferred language.",
			color: "#ec4899",
		},
		{
			icon: DevicesIcon,
			title: t("about_feature_responsive_title") || "Works on Any Device",
			description:
				t("about_feature_responsive_desc") ||
				"MemoDeck is a progressive web app that works seamlessly on desktop, tablet, and mobile. Study anywhere, anytime.",
			color: "#06b6d4",
		},
	];

	const steps = [
		{
			title: t("about_step1_title") || "Create an Account",
			description:
				t("about_step1_desc") ||
				"Sign in quickly and securely with your Google account. No additional registration required.",
		},
		{
			title: t("about_step2_title") || "Build Your Decks",
			description:
				t("about_step2_desc") ||
				"Create flashcard decks on any subject. Add cards with front and back text, or import existing decks.",
		},
		{
			title: t("about_step3_title") || "Choose a Game Mode",
			description:
				t("about_step3_desc") ||
				"Pick from Standard, Write, Multiple Choice, or Match mode. Add timed or survival challenges for variety.",
		},
		{
			title: t("about_step4_title") || "Track Your Progress",
			description:
				t("about_step4_desc") ||
				"View detailed statistics, track your streaks, and earn achievements as you improve your knowledge.",
		},
	];

	const faqs = [
		{
			question: t("about_faq1_q") || "Is MemoDeck free to use?",
			answer:
				t("about_faq1_a") ||
				"Yes! MemoDeck offers a free plan that includes deck creation, all game modes, statistics, and achievements. Premium plans are available for users who need more decks, flashcards, and advanced features.",
		},
		{
			question: t("about_faq2_q") || "What subjects can I study with MemoDeck?",
			answer:
				t("about_faq2_a") ||
				"MemoDeck is versatile and can be used for any subject — languages, science, history, medicine, law, programming, exam preparation, and more. You create your own custom decks so the content is entirely up to you.",
		},
		{
			question:
				t("about_faq3_q") || "How does spaced repetition work in MemoDeck?",
			answer:
				t("about_faq3_a") ||
				"MemoDeck tracks which cards you find difficult and which ones you know well. Hard mode lets you focus specifically on cards you've gotten wrong, ensuring you spend more time on material that needs practice.",
		},
		{
			question: t("about_faq4_q") || "Can I use MemoDeck on my phone?",
			answer:
				t("about_faq4_a") ||
				"Absolutely! MemoDeck is a progressive web app (PWA) that works on any device with a modern browser. You can add it to your home screen for quick access on iOS and Android.",
		},
		{
			question: t("about_faq5_q") || "How do game modes work?",
			answer:
				t("about_faq5_a") ||
				"Standard mode shows you the front of a card and you flip to see the answer. Write mode asks you to type the answer. Multiple Choice gives you options to select from. Match mode is a memory game where you pair fronts with backs. Each mode can be combined with timed or survival challenges.",
		},
		{
			question: t("about_faq6_q") || "Is my data secure?",
			answer:
				t("about_faq6_a") ||
				"Yes. We use Google Firebase for secure authentication, and your data is stored safely. We never share your personal information with third parties except as described in our Privacy Policy.",
		},
	];

	return (
		<Box
			sx={{
				minHeight: "100vh",
				backgroundColor: "background.default",
				py: { xs: 4, sm: 6 },
				px: { xs: 2, sm: 4 },
			}}
		>
			<Box sx={{ maxWidth: 1000, mx: "auto" }}>
				{/* Header */}
				<MotionBox
					initial={{ opacity: 0, y: -16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					sx={{ mb: 6 }}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1.5,
							mb: 3,
						}}
					>
						<Box
							component="img"
							src="/images/logo/memodeck.png"
							alt="MemoDeck"
							sx={{
								width: 36,
								height: 36,
								borderRadius: "9px",
								objectFit: "cover",
							}}
						/>
						<Link to="/login" style={{ textDecoration: "none" }}>
							<Typography
								variant="h6"
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
						</Link>
					</Box>

					<Typography
						variant="h3"
						sx={{
							fontWeight: 800,
							color: "text.primary",
							fontFamily: "Inter, sans-serif",
							mb: 2,
							fontSize: { xs: "1.75rem", sm: "2.5rem" },
						}}
					>
						{t("about_hero_title") ||
							"Master Any Subject with Smart Flashcards"}
					</Typography>
					<Typography
						variant="h6"
						sx={{
							color: "text.secondary",
							fontFamily: "Inter, sans-serif",
							fontWeight: 400,
							lineHeight: 1.7,
							maxWidth: 700,
						}}
					>
						{t("about_hero_subtitle") ||
							"MemoDeck is a modern flashcard learning application designed to help students, professionals, and lifelong learners master any topic through interactive study modes, progress tracking, and a rewarding achievement system."}
					</Typography>
				</MotionBox>

				{/* Features Grid */}
				<Box sx={{ mb: 8 }}>
					<MotionBox
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						sx={{ mb: 4 }}
					>
						<Box
							sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
						>
							<RocketLaunchIcon sx={{ color: "primary.main", fontSize: 28 }} />
							<Typography
								variant="h5"
								sx={{
									fontWeight: 700,
									color: "text.primary",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("about_features_title") || "Features"}
							</Typography>
						</Box>
						<Typography
							variant="body1"
							sx={{
								color: "text.secondary",
								fontFamily: "Inter, sans-serif",
							}}
						>
							{t("about_features_subtitle") ||
								"Everything you need for effective learning, all in one place."}
						</Typography>
					</MotionBox>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "1fr 1fr",
								md: "1fr 1fr 1fr",
							},
							gap: 3,
						}}
					>
						{features.map((feature, index) => (
							<FeatureCard
								key={index}
								{...feature}
								delay={0.3 + index * 0.08}
							/>
						))}
					</Box>
				</Box>

				{/* How it Works */}
				<Box sx={{ mb: 8 }}>
					<MotionBox
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						sx={{ mb: 4 }}
					>
						<Box
							sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
						>
							<SchoolIcon sx={{ color: "primary.main", fontSize: 28 }} />
							<Typography
								variant="h5"
								sx={{
									fontWeight: 700,
									color: "text.primary",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("about_howto_title") || "How It Works"}
							</Typography>
						</Box>
					</MotionBox>

					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 3,
							maxWidth: 600,
						}}
					>
						{steps.map((step, index) => (
							<StepCard
								key={index}
								number={index + 1}
								{...step}
								delay={0.5 + index * 0.1}
							/>
						))}
					</Box>
				</Box>

				{/* FAQ */}
				<Box sx={{ mb: 8 }}>
					<MotionBox
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						sx={{ mb: 4 }}
					>
						<Box
							sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
						>
							<TuneIcon sx={{ color: "primary.main", fontSize: 28 }} />
							<Typography
								variant="h5"
								sx={{
									fontWeight: 700,
									color: "text.primary",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("about_faq_title") || "Frequently Asked Questions"}
							</Typography>
						</Box>
					</MotionBox>

					<Box sx={{ maxWidth: 700 }}>
						{faqs.map((faq, index) => (
							<Accordion
								key={index}
								disableGutters
								elevation={0}
								sx={{
									mb: 1,
									borderRadius: "12px !important",
									overflow: "hidden",
									background:
										theme.palette.mode === "dark"
											? "rgba(30, 41, 59, 0.6)"
											: "rgba(255, 255, 255, 0.8)",
									border: `1px solid ${
										theme.palette.mode === "dark"
											? "rgba(255, 255, 255, 0.08)"
											: "rgba(0, 0, 0, 0.06)"
									}`,
									"&:before": { display: "none" },
									"&.Mui-expanded": {
										mt: 0,
										mb: 1,
									},
								}}
							>
								<AccordionSummary
									expandIcon={
										<ExpandMoreIcon sx={{ color: "text.secondary" }} />
									}
								>
									<Typography
										sx={{
											fontWeight: 600,
											fontFamily: "Inter, sans-serif",
											color: "text.primary",
											fontSize: "0.95rem",
										}}
									>
										{faq.question}
									</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Typography
										sx={{
											fontFamily: "Inter, sans-serif",
											color: "text.secondary",
											lineHeight: 1.7,
										}}
									>
										{faq.answer}
									</Typography>
								</AccordionDetails>
							</Accordion>
						))}
					</Box>
				</Box>

				{/* CTA */}
				<MotionBox
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7, duration: 0.4 }}
					sx={{
						textAlign: "center",
						p: { xs: 4, sm: 6 },
						borderRadius: "20px",
						background:
							"linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
						border: `1px solid ${
							theme.palette.mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(59, 130, 246, 0.12)"
						}`,
						mb: 6,
					}}
				>
					<Typography
						variant="h5"
						sx={{
							fontWeight: 700,
							color: "text.primary",
							fontFamily: "Inter, sans-serif",
							mb: 1.5,
						}}
					>
						{t("about_cta_title") || "Ready to Start Learning?"}
					</Typography>
					<Typography
						variant="body1"
						sx={{
							color: "text.secondary",
							fontFamily: "Inter, sans-serif",
							mb: 3,
							maxWidth: 500,
							mx: "auto",
						}}
					>
						{t("about_cta_subtitle") ||
							"Join thousands of learners using MemoDeck to master new subjects every day. It's free to get started."}
					</Typography>
					<Link to="/login" style={{ textDecoration: "none" }}>
						<Box
							component="button"
							sx={{
								px: 4,
								py: 1.5,
								borderRadius: "12px",
								background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
								color: "#fff",
								fontWeight: 700,
								fontFamily: "Inter, sans-serif",
								fontSize: "1rem",
								border: "none",
								cursor: "pointer",
								transition: "all 0.2s ease",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
								},
							}}
						>
							{t("about_cta_button") || "Get Started for Free"}
						</Box>
					</Link>
				</MotionBox>

				{/* Footer links */}
				<Box
					sx={{
						pt: 3,
						borderTop: `1px solid ${theme.palette.divider}`,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						flexWrap: "wrap",
						gap: 2,
					}}
				>
					{/* Footer links removed per request */}
					<Typography
						variant="body2"
						sx={{
							color: "text.secondary",
							fontFamily: "Inter, sans-serif",
						}}
					>
						© {new Date().getFullYear()} MemoDeck.{" "}
						<a href="mailto:memodeck26@gmail.com" style={{ color: "inherit" }}>
							memodeck26@gmail.com
						</a>
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
