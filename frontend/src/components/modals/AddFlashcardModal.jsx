import React, { useContext, useState } from "react";
import {
	Box,
	Typography,
	alpha,
	useTheme,
	Snackbar,
	Alert,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AddCardIcon from "@mui/icons-material/AddCard";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { I18nContext } from "../../utils/i18n";
import { StyledModal, StyledTextField, StyledButton } from "../ui";

const MotionBox = motion.create(Box);

export default function AddFlashcardModal({
	open,
	onClose,
	onSave,
	loading,
	error,
	editFlashcard,
	onDelete,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	const [front, setFront] = useState(
		editFlashcard ? editFlashcard.front_text : "",
	);
	const [back, setBack] = useState(
		editFlashcard ? editFlashcard.back_text : "",
	);

	React.useEffect(() => {
		if (editFlashcard) {
			setFront(editFlashcard.front_text);
			setBack(editFlashcard.back_text);
		} else {
			setFront("");
			setBack("");
		}
	}, [editFlashcard, open]);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	const handleSubmit = async () => {
		try {
			await onSave(front, back);
			setSnackbar({
				open: true,
				message: editFlashcard
					? t("flashcard_updated") || "Flashcard updated successfully"
					: t("flashcard_added") || "Flashcard added successfully",
				severity: "success",
			});
			if (!editFlashcard) {
				setFront("");
				setBack("");
			}
		} catch (err) {
			setSnackbar({
				open: true,
				message:
					err?.response?.data?.error ||
					t("flashcard_error") ||
					"Error saving flashcard",
				severity: "error",
			});
		}
	};

	const handleDelete = async () => {
		if (!onDelete) return;
		try {
			await onDelete();
			setSnackbar({
				open: true,
				message: t("flashcard_deleted") || "Flashcard deleted successfully",
				severity: "success",
			});
			// show snackbar first, then close modal so message is visible
			setTimeout(() => {
				onClose();
				setFront("");
				setBack("");
			}, 850);
		} catch (err) {
			setSnackbar({
				open: true,
				message:
					err?.response?.data?.error ||
					t("delete_flashcard_error") ||
					"Error deleting flashcard",
				severity: "error",
			});
		}
	};

	return (
		<>
			<StyledModal
				open={open}
				onClose={onClose}
				title={
					editFlashcard
						? t("update_flashcard") || "Update Card"
						: t("add_flashcard") || "Add Card"
				}
				icon={
					editFlashcard ? (
						<EditNoteIcon sx={{ fontSize: 24, color: "white" }} />
					) : (
						<AddCardIcon sx={{ fontSize: 24, color: "white" }} />
					)
				}
				maxWidth="sm"
				actions={
					<>
						<StyledButton variant="ghost" onClick={onClose}>
							{t("cancel") || "Cancel"}
						</StyledButton>
						{editFlashcard && onDelete && (
							<StyledButton
								variant="danger"
								onClick={handleDelete}
								disabled={loading}
							>
								{loading
									? t("deleting") || "Deleting..."
									: t("delete") || "Delete"}
							</StyledButton>
						)}
						<StyledButton
							variant="success"
							onClick={handleSubmit}
							disabled={loading || !front.trim() || !back.trim()}
						>
							{loading
								? t("saving") || "Saving..."
								: editFlashcard
									? t("update") || "Update"
									: t("add") || "Add"}
						</StyledButton>
					</>
				}
			>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
					{/* Front side input */}
					<Box>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mb: 1.5,
							}}
						>
							<Box
								sx={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									background:
										"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
								}}
							/>
							<Typography
								variant="caption"
								sx={{
									fontWeight: 600,
									color: "text.cardSubtitle",
									textTransform: "uppercase",
									letterSpacing: "0.08em",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("front_side") || "Question / Front"}
							</Typography>
						</Box>
						<StyledTextField
							value={front}
							onChange={(e) => setFront(e.target.value)}
							fullWidth
							autoFocus
							placeholder={
								t("enter_the_question_or_term") ||
								"Enter the question or term..."
							}
							error={!!error}
						/>
					</Box>

					{/* Back side input */}
					<Box>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mb: 1.5,
							}}
						>
							<Box
								sx={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									background:
										"linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
								}}
							/>
							<Typography
								variant="caption"
								sx={{
									fontWeight: 600,
									color: "text.cardSubtitle",
									textTransform: "uppercase",
									letterSpacing: "0.08em",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("back_side") || "Answer / Back"}
							</Typography>
						</Box>
						<StyledTextField
							value={back}
							onChange={(e) => setBack(e.target.value)}
							fullWidth
							multiline
							minRows={3}
							placeholder={
								t("enter_the_answer_or_definition") ||
								"Enter the answer or definition..."
							}
							error={!!error}
						/>
					</Box>

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
			</StyledModal>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					variant="filled"
					sx={{ width: "100%", color: "#fff" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}
