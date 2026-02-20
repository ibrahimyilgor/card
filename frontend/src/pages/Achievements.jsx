import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, Grid, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { getAchievements } from "../services/achievementServices";
import { I18nContext } from "../utils/i18n";
import {
	PageContainer,
	StyledCard,
	AchievementsSkeleton,
} from "../components/ui";
import { useSEO } from "../utils/seo";

const MotionBox = motion.create(Box);

// Category colors
const categoryColors = {
	streak: "#f97316", // Orange
	accuracy: "#4ECDC4", // Teal/Turquoise
	volume: "#9B59B6", // Purple
};

// Category icon components
const CategoryIconComponent = ({ category, size = 24, color }) => {
	const iconSx = { fontSize: size, color: color || categoryColors[category] };
	switch (category) {
		case "streak":
			return <LocalFireDepartmentIcon sx={iconSx} />;
		case "accuracy":
			return <GpsFixedIcon sx={iconSx} />;
		case "volume":
			return <MenuBookIcon sx={iconSx} />;
		default:
			return <EmojiEventsIcon sx={iconSx} />;
	}
};

function AchievementCard({ achievement, index }) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const isDark = theme.palette.mode === "dark";

	const categoryColor =
		categoryColors[achievement.category] || theme.palette.primary.main;
	const isEarned = achievement.earned;

	const getAchievementTitle = () => {
		const key = `achievement_${achievement.name}`;
		return t(key) || achievement.description;
	};

	return (
		<MotionBox
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
			sx={{ height: "100%" }}
		>
			<StyledCard
				sx={{
					p: 3,
					height: "100%",
					minHeight: 220,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
					width: "200px",
					opacity: isEarned ? 1 : 0.5,
					border: isEarned
						? `2px solid ${categoryColor}`
						: `2px solid ${
								isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
							}`,
					background: isEarned
						? `linear-gradient(135deg, ${alpha(categoryColor, 0.1)} 0%, ${alpha(
								categoryColor,
								0.05,
							)} 100%)`
						: undefined,
					filter: isEarned ? "none" : "grayscale(100%)",
					transition: "all 0.3s ease",
					"&:hover": {
						transform: isEarned ? "translateY(-4px)" : "none",
						boxShadow: isEarned
							? `0 8px 24px ${alpha(categoryColor, 0.3)}`
							: undefined,
					},
				}}
			>
				{/* Done count badge */}
				{isEarned && achievement.done_count > 1 && (
					<Box
						sx={{
							position: "absolute",
							top: 12,
							right: 12,
							bgcolor: categoryColor,
							color: "#fff",
							px: 1.5,
							py: 0.25,
							borderRadius: 2,
							fontSize: "0.75rem",
							fontWeight: 700,
							fontFamily: "Inter, sans-serif",
						}}
					>
						x{achievement.done_count}
					</Box>
				)}

				{/* Icon */}
				<Box
					sx={{
						width: 64,
						height: 64,
						borderRadius: "50%",
						background: isEarned
							? `linear-gradient(135deg, ${alpha(
									categoryColor,
									0.2,
								)} 0%, ${alpha(categoryColor, 0.1)} 100%)`
							: isDark
								? "rgba(255, 255, 255, 0.05)"
								: "rgba(0, 0, 0, 0.05)",
						border: isEarned
							? `2px solid ${categoryColor}`
							: `2px solid ${
									isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
								}`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						mx: "auto",
						mb: 2,
					}}
				>
					<CategoryIconComponent
						category={achievement.category}
						size={32}
						color={isEarned ? categoryColor : undefined}
					/>
				</Box>

				{/* Title */}
				<Typography
					variant="h6"
					sx={{
						fontWeight: 600,
						fontFamily: "Inter, sans-serif",
						color: isEarned ? categoryColor : "text.secondary",
						textAlign: "center",
						mb: 1,
						fontSize: "1rem",
					}}
				>
					{getAchievementTitle()}
				</Typography>

				{/* Category */}
				<Typography
					variant="body2"
					sx={{
						fontFamily: "Inter, sans-serif",
						color: "text.secondary",
						textAlign: "center",
						textTransform: "capitalize",
					}}
				>
					{t(`achievement_category_${achievement.category}`) ||
						achievement.category}
				</Typography>

				{/* Earned date */}
				{isEarned && achievement.earned_at && (
					<Typography
						variant="caption"
						sx={{
							display: "block",
							fontFamily: "Inter, sans-serif",
							color: "text.secondary",
							textAlign: "center",
							mt: 1,
						}}
					>
						{new Date(achievement.earned_at).toLocaleDateString()}
					</Typography>
				)}
			</StyledCard>
		</MotionBox>
	);
}

export default function Achievements() {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const [achievements, setAchievements] = useState([]);
	const [loading, setLoading] = useState(true);

	useSEO("achievements");

	useEffect(() => {
		const fetchAchievements = async () => {
			try {
				const data = await getAchievements();
				setAchievements(data.achievements || []);
			} catch (error) {
				console.error("Error fetching achievements:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAchievements();
	}, []);

	const earnedCount = achievements.filter((a) => a.earned).length;
	const totalCount = achievements.length;

	// Group achievements by category
	const groupedAchievements = achievements.reduce((acc, achievement) => {
		const category = achievement.category;
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(achievement);
		return acc;
	}, {});

	return (
		<PageContainer>
			<Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 } }}>
				{/* Header */}
				<MotionBox
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					sx={{ mb: 4 }}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 2,
							mb: 1,
						}}
					>
						<EmojiEventsIcon
							sx={{
								fontSize: 36,
								color: "primary.main",
							}}
						/>
						<Typography
							variant="h4"
							sx={{
								fontWeight: 700,
								fontFamily: "Inter, sans-serif",
								color: "text.primary",
							}}
						>
							{t("achievements") || "Achievements"}
						</Typography>
					</Box>
					<Typography
						variant="body1"
						sx={{
							color: "text.secondary",
							fontFamily: "Inter, sans-serif",
						}}
					>
						{t("achievements_subtitle") || "Track your learning milestones"}
					</Typography>

					{/* Progress indicator */}
					{!loading && (
						<MotionBox
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
							sx={{
								mt: 3,
								display: "inline-flex",
								alignItems: "center",
								gap: 2,
								px: 3,
								py: 1.5,
								borderRadius: 3,
								bgcolor: (theme) =>
									theme.palette.mode === "dark"
										? "rgba(255, 255, 255, 0.05)"
										: "rgba(0, 0, 0, 0.03)",
								border: (theme) =>
									`1px solid ${
										theme.palette.mode === "dark"
											? "rgba(255, 255, 255, 0.1)"
											: "rgba(0, 0, 0, 0.08)"
									}`,
							}}
						>
							<Typography
								variant="h5"
								sx={{
									fontWeight: 700,
									fontFamily: "Inter, sans-serif",
									background:
										"linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								{earnedCount}/{totalCount}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: "text.secondary",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("achievements_earned") || "achievements earned"}
							</Typography>
						</MotionBox>
					)}
				</MotionBox>

				{/* Achievements by category */}
				{loading ? (
					<AchievementsSkeleton />
				) : (
					Object.entries(groupedAchievements).map(
						([category, categoryAchievements], categoryIndex) => (
							<MotionBox
								key={category}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
								sx={{ mb: 5 }}
							>
								{/* Category header */}
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1.5,
										mb: 2,
									}}
								>
									<CategoryIconComponent category={category} size={28} />
									<Typography
										variant="h6"
										sx={{
											fontWeight: 600,
											fontFamily: "Inter, sans-serif",
											color: categoryColors[category],
											textTransform: "capitalize",
										}}
									>
										{t(`achievement_category_${category}`) || category}
									</Typography>
								</Box>

								{/* Achievement cards */}
								<Grid container spacing={2} sx={{ alignItems: "stretch" }}>
									{categoryAchievements.map((achievement, index) => (
										<Grid
											item
											xs={6}
											sm={4}
											md={3}
											key={achievement.id}
											sx={{ display: "flex" }}
										>
											<AchievementCard
												achievement={achievement}
												index={categoryIndex * 4 + index}
											/>
										</Grid>
									))}
								</Grid>
							</MotionBox>
						),
					)
				)}
			</Box>
		</PageContainer>
	);
}
