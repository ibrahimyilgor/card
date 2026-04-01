import React, { useState, useEffect, useRef, useContext } from "react";
import {
	Box,
	IconButton,
	Typography,
	CircularProgress,
	Chip,
	alpha,
	useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import { motion, AnimatePresence } from "framer-motion";
import { I18nContext } from "../../utils/i18n";
import { getAllPlans, getMyPlan } from "../../services/accountServices";

const MotionBox = motion.create(Box);

// ── Mini plan card (no action button) ──
function OverlayPlanCard({ plan, isCurrentPlan, planColor, t }) {
	const theme = useTheme();

	const getPlanIcon = (code) => {
		switch (code) {
			case "pro":
				return <StarIcon sx={{ fontSize: 28 }} />;
			case "premium":
				return <WorkspacePremiumIcon sx={{ fontSize: 28 }} />;
			default:
				return <EventNoteIcon sx={{ fontSize: 28 }} />;
		}
	};

	return (
		<Box
			sx={{
				p: 2.5,
				borderRadius: 2,
				position: "relative",
				border: isCurrentPlan
					? `2px solid ${planColor}`
					: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
				background: isCurrentPlan
					? `linear-gradient(135deg, ${alpha(planColor, 0.12)} 0%, ${alpha(planColor, 0.03)} 100%)`
					: alpha(theme.palette.background.paper, 0.06),
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			{isCurrentPlan && (
				<Chip
					label={t("current_plan") || "Current Plan"}
					size="small"
					sx={{
						position: "absolute",
						top: 8,
						right: 8,
						backgroundColor: planColor,
						color: "#fff",
						fontWeight: 600,
						fontSize: "0.65rem",
					}}
				/>
			)}

			{/* Name & price */}
			<Typography
				variant="subtitle1"
				sx={{
					fontWeight: 700,
					color: "white",
					fontFamily: "Inter, sans-serif",
				}}
			>
				{plan.name}
			</Typography>
			<Box sx={{ display: "flex", alignItems: "baseline", mb: 1 }}>
				<Typography
					variant="h5"
					sx={{
						fontWeight: 800,
						color: planColor,
						fontFamily: "Inter, sans-serif",
					}}
				>
					{plan.price_monthly === "0.00" || plan.price_monthly === 0
						? t("free_price") || "Free"
						: t("view_price_mobile")}
				</Typography>
			</Box>

			{/* Features */}
			<Box sx={{ flex: 1 }}>
				<FeatureLine
					icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
					text={
						plan.max_decks === null
							? t("unlimited_decks") || "Unlimited decks"
							: `${plan.max_decks} ${t("decks") || "decks"}`
					}
					color={planColor}
				/>
				<FeatureLine
					icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
					text={
						plan.max_flashcards === null
							? t("unlimited_flashcards") || "Unlimited flashcards"
							: `${plan.max_flashcards} ${t("flashcards") || "flashcards"}`
					}
					color={planColor}
				/>
				{plan.advanced_stats && (
					<FeatureLine
						icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
						text={t("advanced_stats") || "Advanced statistics"}
						color={planColor}
					/>
				)}
				{(plan.code === "pro" || plan.code === "premium") && (
					<FeatureLine
						icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
						text={t("no_ads") || "No ads"}
						color={planColor}
					/>
				)}
				{plan.code === "premium" && (
					<FeatureLine
						icon={<AllInclusiveIcon sx={{ fontSize: 16 }} />}
						text={t("all_features") || "All features included"}
						color={planColor}
					/>
				)}
			</Box>
		</Box>
	);
}

function FeatureLine({ icon, text, color }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
			<Box sx={{ color, display: "flex", alignItems: "center" }}>{icon}</Box>
			<Typography
				variant="caption"
				sx={{
					color: "rgba(255,255,255,0.85)",
					fontFamily: "Inter, sans-serif",
				}}
			>
				{text}
			</Typography>
		</Box>
	);
}

// ── Main overlay ──
const CLOSE_DELAY_MS = 10_000;

const VideoAdOverlay = ({ open, onClose }) => {
	const { t } = useContext(I18nContext);
	const theme = useTheme();

	const [plans, setPlans] = useState([]);
	const [myPlanCode, setMyPlanCode] = useState(null);
	const [loadingPlans, setLoadingPlans] = useState(true);

	const [remainingTime, setRemainingTime] = useState(0);
	const [canClose, setCanClose] = useState(false);
	const timerRef = useRef(null);
	const intervalRef = useRef(null);

	// Fetch plans when overlay opens
	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		setLoadingPlans(true);
		(async () => {
			try {
				const [plansRes, myRes] = await Promise.all([
					getAllPlans(),
					getMyPlan().catch(() => ({ data: { plan: null } })),
				]);
				if (cancelled) return;
				setPlans(plansRes.data.plans || []);
				setMyPlanCode(myRes.data?.plan?.code || myRes.data?.code || null);
			} catch (err) {
				console.error("Failed to load plans for overlay:", err);
			} finally {
				if (!cancelled) setLoadingPlans(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [open]);

	// Timer: start countdown when overlay opens
	useEffect(() => {
		if (open) {
			const seconds = Math.ceil(CLOSE_DELAY_MS / 1000);
			setRemainingTime(seconds);
			setCanClose(false);

			intervalRef.current = setInterval(() => {
				setRemainingTime((prev) => {
					if (prev <= 1) {
						clearInterval(intervalRef.current);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			timerRef.current = setTimeout(() => setCanClose(true), CLOSE_DELAY_MS);
		} else {
			setCanClose(false);
			setRemainingTime(0);
			if (timerRef.current) clearTimeout(timerRef.current);
			if (intervalRef.current) clearInterval(intervalRef.current);
		}
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [open]);

	const getPlanColor = (code) => {
		switch (code) {
			case "pro":
				return theme.palette.warning?.main || "#f59e0b";
			case "premium":
				return theme.palette.secondary?.main || "#8b5cf6";
			default:
				return theme.palette.primary?.main || "#3b82f6";
		}
	};

	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
		exit: { opacity: 0 },
	};

	const contentVariants = {
		hidden: { scale: 0.9, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: { delay: 0.1, type: "spring", stiffness: 200 },
		},
		exit: { scale: 0.9, opacity: 0 },
	};

	return (
		<AnimatePresence>
			{open && (
				<MotionBox
					variants={overlayVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					sx={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						width: "100vw",
						height: "100vh",
						bgcolor: "rgba(0, 0, 0, 1)",
						zIndex: 9999,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "column",
						overflow: "auto",
					}}
				>
					{/* Close / countdown — top right */}
					{canClose ? (
						<IconButton
							onClick={onClose}
							sx={{
								position: "fixed",
								top: { xs: 16, sm: 24 },
								right: { xs: 16, sm: 24 },
								color: "white",
								bgcolor: "rgba(255, 255, 255, 0.1)",
								"&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
								zIndex: 10000,
							}}
						>
							<CloseIcon />
						</IconButton>
					) : (
						<Typography
							variant="h6"
							sx={{
								position: "fixed",
								top: { xs: 16, sm: 24 },
								right: { xs: 16, sm: 24 },
								color: "rgba(255,255,255,0.6)",
								fontWeight: 700,
								fontFamily: "Inter, sans-serif",
								zIndex: 10000,
							}}
						>
							{remainingTime}s
						</Typography>
					)}

					{/* Content */}
					<MotionBox
						variants={contentVariants}
						sx={{
							width: { xs: "95%", sm: "90%", md: "80%" },
							maxWidth: 960,
							py: { xs: 3, sm: 4 },
							px: { xs: 2, sm: 3 },
						}}
					>
						{/* Title */}
						<Typography
							variant="h5"
							sx={{
								textAlign: "center",
								fontWeight: 700,
								color: "white",
								fontFamily: "Inter, sans-serif",
								mb: 0.5,
							}}
						>
							{t("plans_title") || "Plans"}
						</Typography>
						<Typography
							variant="body2"
							sx={{
								textAlign: "center",
								color: "rgba(255,255,255,0.55)",
								fontFamily: "Inter, sans-serif",
								mb: 3,
							}}
						>
							{t("plans_subtitle") ||
								"Choose the plan that best fits your learning needs"}
						</Typography>

						{loadingPlans ? (
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									py: 6,
								}}
							>
								<CircularProgress sx={{ color: "white" }} />
							</Box>
						) : (
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: {
										xs: "1fr",
										sm: "1fr 1fr",
										md: "1fr 1fr 1fr",
									},
									gap: 2.5,
								}}
							>
								{plans.map((plan) => (
									<OverlayPlanCard
										key={plan.id}
										plan={plan}
										isCurrentPlan={myPlanCode === plan.code}
										planColor={getPlanColor(plan.code)}
										t={t}
									/>
								))}
							</Box>
						)}
					</MotionBox>
				</MotionBox>
			)}
		</AnimatePresence>
	);
};

export default VideoAdOverlay;
