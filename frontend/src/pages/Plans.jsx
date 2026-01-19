import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSEO } from "../utils/seo";
import PageContainer from "../components/ui/PageContainer";
import { StyledCard, StyledButton, PlanSkeleton } from "../components/ui";
import { Typography, Box, Chip, alpha, useTheme } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import { getAllPlans, getMyPlan } from "../services/accountServices";
import { I18nContext } from "../utils/i18n";

const MotionBox = motion.create(Box);

// Plan card component
function PlanCard({ plan, isCurrentPlan, delay = 0 }) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	const getPlanIcon = (code) => {
		switch (code) {
			case "pro":
				return <StarIcon sx={{ fontSize: 32 }} />;
			case "premium":
				return <WorkspacePremiumIcon sx={{ fontSize: 32 }} />;
			default:
				return <EventNoteIcon sx={{ fontSize: 32 }} />;
		}
	};

	const getPlanColor = (code) => {
		switch (code) {
			case "pro":
				return theme.palette.warning.main;
			case "premium":
				return theme.palette.secondary.main;
			default:
				return theme.palette.primary.main;
		}
	};

	const planColor = getPlanColor(plan.code);

	return (
		<MotionBox
			initial={{ y: 20 }}
			animate={{ y: 0 }}
			transition={{ delay, duration: 0.4 }}
			sx={{ height: "100%" }}
		>
			<StyledCard
				variant={isCurrentPlan ? "elevated" : "default"}
				sx={{
					p: 3,
					height: "100%",
					display: "flex",
					flexDirection: "column",
					position: "relative",
					border: isCurrentPlan
						? `2px solid ${planColor}`
						: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
					background: isCurrentPlan
						? `linear-gradient(135deg, ${alpha(planColor, 0.08)} 0%, ${alpha(
								planColor,
								0.02,
							)} 100%)`
						: undefined,
				}}
			>
				{/* Current plan badge */}
				{isCurrentPlan && (
					<Chip
						label={t("current_plan") || "Current Plan"}
						size="small"
						sx={{
							position: "absolute",
							top: 12,
							right: 12,
							backgroundColor: planColor,
							color: "#fff",
							fontWeight: 600,
							fontSize: "0.7rem",
						}}
					/>
				)}

				{/* Plan icon */}
				<Box
					sx={{
						width: 64,
						height: 64,
						borderRadius: "16px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: `linear-gradient(135deg, ${alpha(
							planColor,
							0.2,
						)} 0%, ${alpha(planColor, 0.05)} 100%)`,
						border: `1px solid ${alpha(planColor, 0.3)}`,
						color: planColor,
						mb: 2,
					}}
				>
					{getPlanIcon(plan.code)}
				</Box>

				{/* Plan name & price */}
				<Typography
					variant="h5"
					sx={{
						fontWeight: 700,
						color: "text.cardTitle",
						fontFamily: "Inter, sans-serif",
						mb: 0.5,
					}}
				>
					{plan.name}
				</Typography>

				<Box sx={{ display: "flex", alignItems: "baseline", mb: 2 }}>
					<Typography
						variant="h4"
						sx={{
							fontWeight: 800,
							color: planColor,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{plan.price_monthly === "0.00" || plan.price_monthly === 0
							? t("free_price") || "Free"
							: `$${plan.price_monthly}`}
					</Typography>
					{plan.price_monthly !== "0.00" && plan.price_monthly !== 0 && (
						<Typography
							variant="body2"
							sx={{
								color: "text.cardSubtitle",
								ml: 0.5,
								fontFamily: "Inter, sans-serif",
							}}
						>
							/{t("month") || "month"}
						</Typography>
					)}
				</Box>

				{/* Description */}
				<Typography
					variant="body2"
					sx={{
						color: "text.cardSubtitle",
						fontFamily: "Inter, sans-serif",
						mb: 3,
						minHeight: 40,
					}}
				>
					{plan.description}
				</Typography>

				{/* Features */}
				<Box sx={{ flex: 1, mb: 3 }}>
					<FeatureItem
						icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
						text={
							plan.max_decks === null
								? t("unlimited_decks") || "Unlimited decks"
								: `${plan.max_decks} ${t("decks") || "decks"}`
						}
						color={planColor}
					/>
					<FeatureItem
						icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
						text={
							plan.max_flashcards === null
								? t("unlimited_flashcards") || "Unlimited flashcards"
								: `${plan.max_flashcards} ${t("flashcards") || "flashcards"}`
						}
						color={planColor}
					/>
					{plan.advanced_stats && (
						<FeatureItem
							icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
							text={t("advanced_stats") || "Advanced statistics"}
							color={planColor}
						/>
					)}
					{plan.code === "premium" && (
						<FeatureItem
							icon={<AllInclusiveIcon sx={{ fontSize: 18 }} />}
							text={t("all_features") || "All features included"}
							color={planColor}
						/>
					)}
				</Box>

				{/* Action button */}
				<StyledButton
					variant={isCurrentPlan ? "secondary" : "primary"}
					fullWidth
					disabled={isCurrentPlan}
					sx={{
						backgroundColor: isCurrentPlan ? undefined : planColor,
						"&:hover": {
							backgroundColor: isCurrentPlan
								? undefined
								: alpha(planColor, 0.9),
						},
					}}
				>
					{isCurrentPlan
						? t("current_plan") || "Current Plan"
						: plan.price_monthly === "0.00" || plan.price_monthly === 0
							? t("get_started") || "Get Started"
							: t("upgrade") || "Upgrade"}
				</StyledButton>
			</StyledCard>
		</MotionBox>
	);
}

// Feature item component
function FeatureItem({ icon, text, color }) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1,
				mb: 1.5,
			}}
		>
			<Box sx={{ color, display: "flex", alignItems: "center" }}>{icon}</Box>
			<Typography
				variant="body2"
				sx={{
					color: "text.cardTitle",
					fontFamily: "Inter, sans-serif",
					fontSize: "0.875rem",
				}}
			>
				{text}
			</Typography>
		</Box>
	);
}

export default function Plans() {
	const { t } = useContext(I18nContext);

	// SEO meta tags for plans page
	useSEO("plans");

	const [plans, setPlans] = useState([]);
	const [myPlan, setMyPlan] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [plansRes, myPlanRes] = await Promise.all([
					getAllPlans(),
					getMyPlan(),
				]);
				setPlans(plansRes.data.plans || []);
				setMyPlan(myPlanRes.data.plan || null);
			} catch (err) {
				console.error(err);
				setError(t("plans_fetch_error") || "Failed to load plans");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<PageContainer>
			<MotionBox initial={{ y: -10 }} animate={{ y: 0 }} sx={{ mb: 4 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						flexWrap: "wrap",
						gap: 2,
					}}
				>
					<Box>
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
							<EventNoteIcon sx={{ color: "primary.light", fontSize: 32 }} />
							{t("plans_title") || "Plans"}
						</Typography>
						<Typography
							variant="body2"
							sx={{
								color: "text.cardSubtitle",
								mt: 0.5,
								fontFamily: "Inter, sans-serif",
							}}
						>
							{t("plans_subtitle") ||
								"Choose the plan that best fits your learning needs"}
						</Typography>
					</Box>
				</Box>
			</MotionBox>

			{error && (
				<Box
					sx={{
						p: 2,
						mb: 3,
						borderRadius: 2,
						backgroundColor: "error.light",
						color: "error.contrastText",
					}}
				>
					<Typography>{error}</Typography>
				</Box>
			)}

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
				{loading
					? [1, 2, 3].map((i) => <PlanSkeleton key={i} />)
					: plans.map((plan, index) => (
							<PlanCard
								key={plan.id}
								plan={plan}
								isCurrentPlan={myPlan?.code === plan.code}
								delay={0.1 + index * 0.1}
							/>
						))}
			</Box>
		</PageContainer>
	);
}
