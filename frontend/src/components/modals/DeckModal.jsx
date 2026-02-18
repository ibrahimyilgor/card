import { useState, useEffect, useContext } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import StyleIcon from "@mui/icons-material/Style";
// Game option UI removed
import { I18nContext } from "../../utils/i18n";
import {
	StyledModal,
	StyledTextField,
	StyledButton,
	LimitWarningModal,
} from "../ui";
import { usePlan } from "../../context/PlanContext";

const MotionBox = motion.create(Box);

export default function DeckModal({
	open,
	onClose,
	onSave,
	initialTitle = "",
	initialDesc = "",
	loading = false,
	error = "",
	editDeck = null,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const { canCreateDeck, limitStatus } = usePlan();

	const [title, setTitle] = useState(initialTitle);
	const [desc, setDesc] = useState(initialDesc);
	const [difficultyEnabled, setDifficultyEnabled] = useState(
		editDeck?.difficulty_enabled || false,
	);
	const [mode, setMode] = useState(editDeck?.mode || "standard");
	const [showLimitModal, setShowLimitModal] = useState(false);

	useEffect(() => {
		setTitle(initialTitle);
		setDesc(initialDesc);
		setDifficultyEnabled(editDeck?.difficulty_enabled || false);
		setMode(editDeck?.mode || "standard");
	}, [initialTitle, initialDesc, editDeck, open]);

	const handleSave = () => {
		if (title.trim()) {
			// If editing, always allow; if creating new, check limit
			if (!editDeck && !canCreateDeck) {
				setShowLimitModal(true);
				return;
			}
			onSave(title, desc, {
				difficulty_enabled: difficultyEnabled,
				mode,
			});
		}
	};

	return (
		<StyledModal
			open={open}
			onClose={onClose}
			title={editDeck ? t("edit_deck") : t("new_deck")}
			icon={<StyleIcon sx={{ fontSize: 24, color: "white" }} />}
			maxWidth="sm"
			actions={
				<>
					<StyledButton variant="ghost" onClick={onClose}>
						{t("cancel")}
					</StyledButton>
					<StyledButton
						variant="success"
						onClick={handleSave}
						disabled={loading || !title.trim()}
					>
						{loading
							? t("saving") || "Saving..."
							: editDeck
								? t("edit") || "Edit"
								: t("add") || "Add"}
					</StyledButton>
				</>
			}
		>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
				<StyledTextField
					label={t("deck_title")}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					fullWidth
					autoFocus
					placeholder={
						t("deck_title_placeholder") || "e.g., Spanish Vocabulary"
					}
				/>

				<StyledTextField
					label={t("deck_description")}
					value={desc}
					onChange={(e) => setDesc(e.target.value)}
					fullWidth
					multiline
					minRows={3}
					placeholder={
						t("deck_description_placeholder") ||
						"Optional description for your deck..."
					}
				/>

				{/* Game options removed from modal UI per request */}

				<AnimatePresence initial={false}>
					{error && (
						<MotionBox
							initial={{ y: -10 }}
							animate={{ y: 0 }}
							exit={{ y: -10 }}
							sx={{
								p: 2,
								borderRadius: 2,
								backgroundColor: alpha(theme.palette.error.main, 0.1),
								border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
							}}
						>
							<Typography
								variant="body2"
								sx={{
									color: "error.main",
									fontWeight: 500,
									fontFamily: "Inter, sans-serif",
								}}
							>
								{error}
							</Typography>
						</MotionBox>
					)}
				</AnimatePresence>
			</Box>

			{/* Limit Warning Modal */}
			<LimitWarningModal
				open={showLimitModal}
				onClose={() => setShowLimitModal(false)}
				currentDecks={limitStatus?.currentDecks}
				maxDecks={limitStatus?.maxDecks}
				deckOverage={limitStatus?.deckOverage}
				currentFlashcards={limitStatus?.currentFlashcards}
				maxFlashcards={limitStatus?.maxFlashcards}
				flashcardOverage={limitStatus?.flashcardOverage}
				planCode={limitStatus?.planCode}
				warningType="deck"
			/>
		</StyledModal>
	);
}
