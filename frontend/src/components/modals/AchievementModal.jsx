import React, { useContext, useEffect, useState } from "react";
import {
	Modal,
	Box,
	Typography,
	IconButton,
	useTheme,
	alpha,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Confetti from "react-confetti";
import { I18nContext } from "../../utils/i18n";
import { AchievementContext } from "../../context/AchievementContext";

const MotionBox = motion.create(Box);

// Category colors
const categoryColors = {
	streak: "#f97316", // Orange
	accuracy: "#4ECDC4", // Teal/Turquoise
	volume: "#9B59B6", // Purple
};

// Category icon component - same as Achievements page
const CategoryIconComponent = ({ category, size = 48, color }) => {
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

export default function AchievementModal() {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const {
		currentAchievement,
		isModalOpen,
		closeAchievementModal,
		queueLength,
	} = useContext(AchievementContext);

	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	const [showConfetti, setShowConfetti] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (isModalOpen) {
			setShowConfetti(true);
			// Stop confetti after 3 seconds
			const timer = setTimeout(() => setShowConfetti(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [isModalOpen, currentAchievement]);

	if (!currentAchievement) return null;

	const categoryColor =
		categoryColors[currentAchievement.category] || theme.palette.primary.main;

	const getAchievementTitle = () => {
		const key = `achievement_${currentAchievement.name}`;
		return t(key) || currentAchievement.description;
	};

	const getCategoryName = () => {
		const key = `achievement_category_${currentAchievement.category}`;
		return t(key) || currentAchievement.category;
	};

	return (
		<>
			{showConfetti && (
				<Confetti
					width={windowSize.width}
					height={windowSize.height}
					recycle={false}
					numberOfPieces={200}
					gravity={0.3}
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						zIndex: 9999,
						pointerEvents: "none",
					}}
				/>
			)}

			<Modal
				open={isModalOpen}
				onClose={closeAchievementModal}
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 9998,
				}}
			>
				<AnimatePresence>
					{isModalOpen && (
						<MotionBox
							initial={{ scale: 0.5, opacity: 0, y: 50 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.5, opacity: 0, y: 50 }}
							transition={{ type: "spring", damping: 20, stiffness: 300 }}
							sx={{
								position: "relative",
								width: "90%",
								maxWidth: 400,
								bgcolor: "background.paper",
								borderRadius: 4,
								p: 4,
								textAlign: "center",
								outline: "none",
								border: `3px solid ${categoryColor}`,
								boxShadow: `0 0 40px ${alpha(categoryColor, 0.4)}`,
							}}
						>
							{/* Close button */}
							<IconButton
								onClick={closeAchievementModal}
								sx={{
									position: "absolute",
									top: 12,
									right: 12,
									color: "text.secondary",
								}}
							>
								<CloseIcon />
							</IconButton>

							{/* Queue indicator */}
							{queueLength > 0 && (
								<Typography
									variant="caption"
									sx={{
										position: "absolute",
										top: 16,
										left: 16,
										color: "text.secondary",
										fontFamily: "Inter, sans-serif",
									}}
								>
									+{queueLength} {t("more") || "more"}
								</Typography>
							)}

							{/* Achievement icon */}
							<MotionBox
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ delay: 0.2, type: "spring", damping: 12 }}
								sx={{
									width: 100,
									height: 100,
									borderRadius: "50%",
									background: `linear-gradient(135deg, ${alpha(
										categoryColor,
										0.2
									)} 0%, ${alpha(categoryColor, 0.1)} 100%)`,
									border: `3px solid ${categoryColor}`,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									mx: "auto",
									mb: 3,
								}}
							>
								<CategoryIconComponent
									category={currentAchievement.category}
									size={48}
									color={categoryColor}
								/>
							</MotionBox>

							{/* Title */}
							<MotionBox
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.3 }}
							>
								<Typography
									variant="h5"
									sx={{
										fontWeight: 700,
										fontFamily: "Inter, sans-serif",
										color: "text.primary",
										mb: 1,
									}}
								>
									{t("achievement_earned") || "Achievement Earned!"}
								</Typography>
							</MotionBox>

							{/* Achievement name */}
							<MotionBox
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								<Typography
									variant="h6"
									sx={{
										fontWeight: 600,
										fontFamily: "Inter, sans-serif",
										color: categoryColor,
										mb: 1,
									}}
								>
									{getAchievementTitle()}
								</Typography>
							</MotionBox>

							{/* Category badge */}
							<MotionBox
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.5 }}
							>
								<Box
									sx={{
										display: "inline-block",
										px: 2,
										py: 0.5,
										borderRadius: 2,
										bgcolor: alpha(categoryColor, 0.15),
										color: categoryColor,
										fontWeight: 600,
										fontSize: "0.85rem",
										fontFamily: "Inter, sans-serif",
										textTransform: "capitalize",
									}}
								>
									{getCategoryName()}
								</Box>
							</MotionBox>

							{/* Repeat indicator */}
							{currentAchievement.isRepeat &&
								currentAchievement.done_count > 1 && (
									<MotionBox
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.6, type: "spring" }}
										sx={{ mt: 2 }}
									>
										<Typography
											variant="body2"
											sx={{
												color: "text.secondary",
												fontFamily: "Inter, sans-serif",
											}}
										>
											{t("earned_times") || "Earned"}{" "}
											<strong>x{currentAchievement.done_count}</strong>
										</Typography>
									</MotionBox>
								)}
						</MotionBox>
					)}
				</AnimatePresence>
			</Modal>
		</>
	);
}
