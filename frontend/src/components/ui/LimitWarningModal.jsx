import React, { useContext } from "react";
import { Box, Typography, Divider, alpha } from "@mui/material";
import { useNavigate } from "react-router-dom";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import LayersIcon from "@mui/icons-material/Layers";
import StyleIcon from "@mui/icons-material/Style";
import StyledModal from "./StyledModal";
import StyledButton from "./StyledButton";
import { I18nContext } from "../../utils/i18n";

const LimitWarningModal = ({
	open,
	onClose,
	currentDecks,
	maxDecks,
	deckOverage,
	currentFlashcards,
	maxFlashcards,
	flashcardOverage,
	planCode,
	title,
	warningType = "both", // "deck", "flashcard", or "both"
	showUpgradeButton = true,
}) => {
	const { t } = useContext(I18nContext);
	const navigate = useNavigate();

	const handleUpgrade = () => {
		onClose();
		navigate("/plans");
	};

	// Determine what limits are hit
	const isDeckLimitReached = maxDecks !== null && currentDecks >= maxDecks;
	const isFlashcardLimitReached =
		maxFlashcards !== null && currentFlashcards >= maxFlashcards;
	const hasDeckOverage = deckOverage > 0;
	const hasFlashcardOverage = flashcardOverage > 0;

	// Determine the description based on the situation
	const getDescription = () => {
		if (hasDeckOverage || hasFlashcardOverage) {
			return t(
				"limitWarningDescriptionOverage",
				"You have exceeded your plan limits. Please reduce your content or upgrade your plan to continue.",
			);
		}
		return t(
			"limitWarningDescriptionReached",
			"You have reached your plan limits. Upgrade to create more content.",
		);
	};

	// Get plan display name
	const getPlanDisplayName = () => {
		switch (planCode) {
			case "free":
				return "Free";
			case "pro":
				return "Pro";
			case "premium":
				return "Premium";
			default:
				return planCode || "Free";
		}
	};

	return (
		<StyledModal
			open={open}
			onClose={onClose}
			title={t("limitWarningTitle")}
			icon={<WarningAmberIcon sx={{ color: "theme.palette.primary.main" }} />}
			maxWidth={450}
		>
			<Box sx={{ py: 2 }}>
				{/* Current Plan Badge */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						mb: 2,
					}}
				>
					<Box
						sx={{
							px: 2,
							py: 0.5,
							borderRadius: 2,
							bgcolor: (theme) =>
								planCode === "pro"
									? alpha("#8b5cf6", 0.15)
									: planCode === "premium"
										? alpha("#f59e0b", 0.15)
										: alpha("#6b7280", 0.15),
							color:
								planCode === "pro"
									? "#8b5cf6"
									: planCode === "premium"
										? "#f59e0b"
										: "#6b7280",
							fontWeight: 600,
							fontSize: "0.875rem",
						}}
					>
						{t("currentPlan", "Current Plan")}: {getPlanDisplayName()}
					</Box>
				</Box>

				<Typography
					variant="body1"
					color="text.secondary"
					sx={{ mb: 3, textAlign: "center" }}
				>
					{getDescription()}
				</Typography>

				{/* Limits Info Box */}
				<Box
					sx={{
						bgcolor: "background.default",
						borderRadius: 2,
						p: 2,
						mb: 3,
					}}
				>
					{/* Deck Limit */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<LayersIcon
								sx={{
									fontSize: 20,
									color:
										isDeckLimitReached || hasDeckOverage
											? "error.main"
											: "primary.main",
								}}
							/>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 600,
									color:
										isDeckLimitReached || hasDeckOverage
											? "error.main"
											: "text.primary",
								}}
							>
								{t("limitWarningDeckLimit", "Deck Limit")}
							</Typography>
						</Box>
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: 700,
								color:
									isDeckLimitReached || hasDeckOverage
										? "error.main"
										: "text.primary",
							}}
						>
							{currentDecks ?? "—"}/{maxDecks ?? "—"}
						</Typography>
					</Box>

					<Divider sx={{ my: 1.5 }} />

					{/* Flashcard Limit */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<StyleIcon
								sx={{
									fontSize: 20,
									color:
										isFlashcardLimitReached || hasFlashcardOverage
											? "error.main"
											: "primary.main",
								}}
							/>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 600,
									color:
										isFlashcardLimitReached || hasFlashcardOverage
											? "error.main"
											: "text.primary",
								}}
							>
								{t("limitWarningFlashcardLimit", "Flashcard Limit")}
							</Typography>
						</Box>
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: 700,
								color:
									isFlashcardLimitReached || hasFlashcardOverage
										? "error.main"
										: "text.primary",
							}}
						>
							{currentFlashcards ?? "—"}/{maxFlashcards ?? "—"}
						</Typography>
					</Box>
				</Box>

				{/* Action Buttons */}
				<Box
					sx={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						gap: 1.5,
					}}
				>
					{showUpgradeButton && planCode !== "premium" ? (
						<>
							<StyledButton
								variant="ghost"
								onClick={onClose}
								sx={{ flex: "0 0 50%" }}
							>
								{t("close", "Close")}
							</StyledButton>
							<StyledButton
								variant="primary"
								onClick={handleUpgrade}
								sx={{ flex: "0 0 50%" }}
							>
								{t("limitWarningUpgradePlan", "Upgrade Plan")}
							</StyledButton>
						</>
					) : (
						<StyledButton variant="ghost" onClick={onClose} sx={{ flex: 1 }}>
							{t("close", "Close")}
						</StyledButton>
					)}
				</Box>
			</Box>
		</StyledModal>
	);
};

export default LimitWarningModal;
