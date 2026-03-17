import React, { useContext, useEffect, useState } from "react";
import {
	getFlashcards,
	createFlashcard,
	deleteFlashcard,
} from "../../services/flashcardServices";
import {
	Typography,
	Box,
	CircularProgress,
	IconButton,
	Tooltip,
	alpha,
	useTheme,
	InputAdornment,
	Snackbar,
	Alert,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import StyleIcon from "@mui/icons-material/Style";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { I18nContext } from "../../utils/i18n";
import { updateFlashcard } from "../../services/flashcardServices";
import {
	StyledModal,
	StyledButton,
	StyledCard,
	EmptyState,
	StyledTextField,
	LimitWarningModal,
} from "../ui";
import { usePlan } from "../../context/PlanContext";

const MotionBox = motion.create(Box);
const MAX_TEXT_LENGTH = 512;

// Inline Add Form Component
function InlineAddForm({ onSubmit, onCancel, loading, t }) {
	const theme = useTheme();
	const [front, setFront] = React.useState("");
	const [back, setBack] = React.useState("");
	const frontRef = React.useRef(null);
	const frontTooLong = front.length > MAX_TEXT_LENGTH;
	const backTooLong = back.length > MAX_TEXT_LENGTH;

	React.useEffect(() => {
		// Auto-focus the front input when form appears
		setTimeout(() => frontRef.current?.focus(), 100);
	}, []);

	const canSubmit =
		front.trim() && back.trim() && !loading && !frontTooLong && !backTooLong;

	const handleSubmit = () => {
		if (!canSubmit) return;
		onSubmit(front, back);
		setFront("");
		setBack("");
		setTimeout(() => frontRef.current?.focus(), 100);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canSubmit) {
			e.preventDefault();
			handleSubmit();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			onCancel();
		}
	};

	return (
		<MotionBox
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.2 }}
		>
			<StyledCard
				variant="default"
				hover={false}
				sx={{
					p: 0,
					overflow: "hidden",
					border: (theme) =>
						`1px solid ${alpha(theme.palette.success.main, 0.4)}`,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "stretch" }}>
					{/* Green color indicator for new card */}
					<Box
						sx={{
							width: 4,
							background: "linear-gradient(180deg, #22c55e 0%, #10b981 100%)",
							flexShrink: 0,
						}}
					/>

					{/* Inputs */}
					<Box
						sx={{
							flex: 1,
							p: 2,
							display: "flex",
							flexDirection: "column",
							gap: 1.5,
						}}
					>
						<StyledTextField
							inputRef={frontRef}
							size="small"
							placeholder={
								t("enter_the_question_or_term") || "Question / Front"
							}
							value={front}
							onChange={(e) => setFront(e.target.value)}
							error={frontTooLong}
							helperText={
								frontTooLong
									? t("max_characters_error", { max: MAX_TEXT_LENGTH })
									: `${front.length}/${MAX_TEXT_LENGTH}`
							}
							inputProps={{ maxLength: MAX_TEXT_LENGTH + 1 }}
							onKeyDown={handleKeyDown}
							fullWidth
						/>
						<StyledTextField
							size="small"
							placeholder={
								t("enter_the_answer_or_definition") || "Answer / Back"
							}
							value={back}
							onChange={(e) => setBack(e.target.value)}
							error={backTooLong}
							helperText={
								backTooLong
									? t("max_characters_error", { max: MAX_TEXT_LENGTH })
									: `${back.length}/${MAX_TEXT_LENGTH}`
							}
							inputProps={{ maxLength: MAX_TEXT_LENGTH + 1 }}
							onKeyDown={handleKeyDown}
							fullWidth
						/>

						{/* Action row */}
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography
								variant="caption"
								sx={{
									color: "text.cardSubtitle",
									fontFamily: "Inter, sans-serif",
									opacity: 0.7,
								}}
							>
								Ctrl + Enter
							</Typography>
							<Box sx={{ display: "flex", gap: 0.5 }}>
								<Tooltip title={t("cancel") || "Cancel"} arrow>
									<IconButton
										size="small"
										onClick={onCancel}
										sx={{
											color: "error.main",
											transition: "all 0.2s",
											"&:hover": {
												backgroundColor: (theme) =>
													alpha(theme.palette.error.main, 0.1),
												transform: "scale(1.1)",
											},
										}}
									>
										<CloseIcon fontSize="small" />
									</IconButton>
								</Tooltip>
								<Tooltip title={t("add") || "Add"} arrow>
									<span>
										<IconButton
											size="small"
											onClick={handleSubmit}
											disabled={!canSubmit}
											sx={{
												color: canSubmit ? "success.main" : "text.disabled",
												transition: "all 0.2s",
												"&:hover": {
													backgroundColor: (theme) =>
														alpha(theme.palette.success.main, 0.1),
													transform: "scale(1.1)",
												},
											}}
										>
											{loading ? (
												<CircularProgress size={18} color="inherit" />
											) : (
												<CheckIcon fontSize="small" />
											)}
										</IconButton>
									</span>
								</Tooltip>
							</Box>
						</Box>
					</Box>
				</Box>
			</StyledCard>
		</MotionBox>
	);
}

// Inline Edit Form Component
function InlineEditForm({ flashcard, onSubmit, onCancel, loading, t }) {
	const theme = useTheme();
	const [front, setFront] = React.useState(flashcard.front_text);
	const [back, setBack] = React.useState(flashcard.back_text);
	const frontRef = React.useRef(null);
	const frontTooLong = front.length > MAX_TEXT_LENGTH;
	const backTooLong = back.length > MAX_TEXT_LENGTH;

	React.useEffect(() => {
		setTimeout(() => frontRef.current?.focus(), 100);
	}, []);

	const hasChanges =
		front.trim() !== flashcard.front_text ||
		back.trim() !== flashcard.back_text;
	const canSubmit =
		front.trim() &&
		back.trim() &&
		!loading &&
		hasChanges &&
		!frontTooLong &&
		!backTooLong;

	const handleSubmit = () => {
		if (!canSubmit) return;
		onSubmit(flashcard.id, front, back);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canSubmit) {
			e.preventDefault();
			handleSubmit();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			onCancel();
		}
	};

	return (
		<MotionBox
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.98 }}
			transition={{ duration: 0.2 }}
			layout="position"
		>
			<StyledCard
				variant="default"
				hover={false}
				sx={{
					p: 0,
					overflow: "hidden",
					border: (theme) =>
						`1px solid ${alpha(theme.palette.warning.main, 0.4)}`,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "stretch" }}>
					{/* Orange color indicator for editing */}
					<Box
						sx={{
							width: 4,
							background: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)",
							flexShrink: 0,
						}}
					/>

					{/* Inputs */}
					<Box
						sx={{
							flex: 1,
							p: 2,
							display: "flex",
							flexDirection: "column",
							gap: 1.5,
						}}
					>
						<StyledTextField
							inputRef={frontRef}
							size="small"
							placeholder={
								t("enter_the_question_or_term") || "Question / Front"
							}
							value={front}
							onChange={(e) => setFront(e.target.value)}
							error={frontTooLong}
							helperText={
								frontTooLong
									? t("max_characters_error", { max: MAX_TEXT_LENGTH })
									: `${front.length}/${MAX_TEXT_LENGTH}`
							}
							inputProps={{ maxLength: MAX_TEXT_LENGTH + 1 }}
							onKeyDown={handleKeyDown}
							fullWidth
						/>
						<StyledTextField
							size="small"
							placeholder={
								t("enter_the_answer_or_definition") || "Answer / Back"
							}
							value={back}
							onChange={(e) => setBack(e.target.value)}
							error={backTooLong}
							helperText={
								backTooLong
									? t("max_characters_error", { max: MAX_TEXT_LENGTH })
									: `${back.length}/${MAX_TEXT_LENGTH}`
							}
							inputProps={{ maxLength: MAX_TEXT_LENGTH + 1 }}
							onKeyDown={handleKeyDown}
							fullWidth
						/>

						{/* Action row */}
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography
								variant="caption"
								sx={{
									color: "text.cardSubtitle",
									fontFamily: "Inter, sans-serif",
									opacity: 0.7,
								}}
							>
								Ctrl + Enter
							</Typography>
							<Box sx={{ display: "flex", gap: 0.5 }}>
								<Tooltip title={t("cancel") || "Cancel"} arrow>
									<IconButton
										size="small"
										onClick={onCancel}
										sx={{
											color: "error.main",
											transition: "all 0.2s",
											"&:hover": {
												backgroundColor: (theme) =>
													alpha(theme.palette.error.main, 0.1),
												transform: "scale(1.1)",
											},
										}}
									>
										<CloseIcon fontSize="small" />
									</IconButton>
								</Tooltip>
								<Tooltip title={t("update") || "Update"} arrow>
									<span>
										<IconButton
											size="small"
											onClick={handleSubmit}
											disabled={!canSubmit}
											sx={{
												color: canSubmit ? "warning.main" : "text.disabled",
												transition: "all 0.2s",
												"&:hover": {
													backgroundColor: (theme) =>
														alpha(theme.palette.warning.main, 0.1),
													transform: "scale(1.1)",
												},
											}}
										>
											{loading ? (
												<CircularProgress size={18} color="inherit" />
											) : (
												<CheckIcon fontSize="small" />
											)}
										</IconButton>
									</span>
								</Tooltip>
							</Box>
						</Box>
					</Box>
				</Box>
			</StyledCard>
		</MotionBox>
	);
}

// Flashcard Item Component
function FlashcardItem({ flashcard, onEdit, onDelete, index, isSearching }) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);

	return (
		<MotionBox
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{
				duration: 0.2,
				delay: isSearching ? 0 : index * 0.03,
			}}
			layout="position"
		>
			<StyledCard
				variant="default"
				sx={{
					p: 0,
					overflow: "hidden",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "stretch" }}>
					{/* Color indicator */}
					<Box
						sx={{
							width: 4,
							background: "linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)",
							flexShrink: 0,
						}}
					/>

					{/* Content */}
					<Box
						sx={{
							flex: 1,
							p: 2,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							gap: 2,
							overflow: "hidden",
						}}
					>
						<Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
							<Tooltip
								title={
									flashcard.front_text.length > 50 ? flashcard.front_text : ""
								}
								arrow
							>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 600,
										color: "text.cardTitle",
										fontFamily: "Inter, sans-serif",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{flashcard.front_text}
								</Typography>
							</Tooltip>
							<Tooltip
								title={
									flashcard.back_text.length > 50 ? flashcard.back_text : ""
								}
								arrow
							>
								<Typography
									variant="body2"
									sx={{
										color: "text.cardSubtitle",
										fontFamily: "Inter, sans-serif",
										fontSize: "0.85rem",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										mt: 0.5,
									}}
								>
									{flashcard.back_text}
								</Typography>
							</Tooltip>
						</Box>

						{/* Actions */}
						<Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
							<Tooltip title={t("edit") || "Edit"} arrow>
								<IconButton
									size="small"
									onClick={() => onEdit(flashcard)}
									sx={{
										color: "warning.main",
										transition: "all 0.2s",
										"&:hover": {
											backgroundColor: (theme) =>
												alpha(theme.palette.warning.main, 0.1),
											transform: "scale(1.1)",
										},
									}}
								>
									<EditIcon fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title={t("delete") || "Delete"} arrow>
								<IconButton
									size="small"
									onClick={() => onDelete(flashcard.id)}
									sx={{
										color: "error.main",
										transition: "all 0.2s",
										"&:hover": {
											backgroundColor: (theme) =>
												alpha(theme.palette.error.main, 0.1),
											transform: "scale(1.1)",
										},
									}}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>
				</Box>
			</StyledCard>
		</MotionBox>
	);
}

export default function FlashcardModal({
	open,
	onClose,
	deckTitle,
	deckId,
	onCardsChange,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const { canCreateFlashcard, limitStatus, fetchLimitStatus } = usePlan();

	const [flashcards, setFlashcards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [addLoading, setAddLoading] = useState(false);
	const [editLoading, setEditLoading] = useState(false);
	const [isInlineAdding, setIsInlineAdding] = useState(false);
	const [editingFlashcardId, setEditingFlashcardId] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [showLimitModal, setShowLimitModal] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

	// Filter flashcards based on search query
	const filteredFlashcards = flashcards.filter((flashcard) => {
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase();
		return (
			flashcard.front_text.toLowerCase().includes(query) ||
			flashcard.back_text.toLowerCase().includes(query)
		);
	});

	const handleDeleteFlashcard = async (flashcardId) => {
		try {
			await deleteFlashcard(flashcardId);
			setFlashcards((prev) => prev.filter((f) => f.id !== flashcardId));
			if (onCardsChange) onCardsChange();
			// Refresh limit status after deletion
			fetchLimitStatus();
			setSnackbar({
				open: true,
				message: t("flashcard_deleted") || "Flashcard deleted",
				severity: "success",
			});
		} catch (err) {
			console.error("Error deleting flashcard:", err);
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

	// Inline edit handler — update in place
	const handleInlineEdit = async (flashcardId, front, back) => {
		if (front.length > MAX_TEXT_LENGTH || back.length > MAX_TEXT_LENGTH) {
			setSnackbar({
				open: true,
				message: t("max_characters_error", { max: MAX_TEXT_LENGTH }),
				severity: "error",
			});
			return;
		}
		setEditLoading(true);
		try {
			const res = await updateFlashcard(flashcardId, {
				frontText: front,
				backText: back,
			});
			if (res.data && res.data.flashcard) {
				setFlashcards((prev) =>
					prev.map((f) =>
						f.id === flashcardId
							? { ...f, front_text: front, back_text: back }
							: f,
					),
				);
				setEditingFlashcardId(null);
				setSnackbar({
					open: true,
					message: t("flashcard_updated") || "Flashcard updated",
					severity: "success",
				});
			} else {
				setSnackbar({
					open: true,
					message: res.data?.error || "Failed to update flashcard",
					severity: "error",
				});
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
		} finally {
			setEditLoading(false);
		}
	};

	// Inline add handler — stays in the same modal
	const handleInlineAdd = async (front, back) => {
		if (front.length > MAX_TEXT_LENGTH || back.length > MAX_TEXT_LENGTH) {
			setSnackbar({
				open: true,
				message: t("max_characters_error", { max: MAX_TEXT_LENGTH }),
				severity: "error",
			});
			return;
		}
		setAddLoading(true);
		try {
			const res = await createFlashcard({
				deckId,
				frontText: front,
				backText: back,
			});
			if (res.data && res.data.flashcard) {
				setFlashcards((prev) => [...prev, res.data.flashcard]);
				setSnackbar({
					open: true,
					message: t("flashcard_added") || "Flashcard added",
					severity: "success",
				});
				if (onCardsChange) onCardsChange();
				fetchLimitStatus();
			} else {
				setSnackbar({
					open: true,
					message: res.data?.error || "Failed to add flashcard",
					severity: "error",
				});
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
		} finally {
			setAddLoading(false);
		}
	};

	useEffect(() => {
		const fetchFlashcardsList = async () => {
			if (!open || !deckId) return;
			setLoading(true);
			try {
				const res = await getFlashcards(deckId);
				if (res.data && Array.isArray(res.data.flashcards)) {
					setFlashcards(res.data.flashcards);
				} else {
					setFlashcards([]);
				}
			} catch (err) {
				console.error("Error fetching flashcards:", err);
				setFlashcards([]);
			} finally {
				setLoading(false);
			}
		};
		fetchFlashcardsList();
	}, [deckId, open]);

	// Reset search query and inline states when modal closes
	useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setIsInlineAdding(false);
			setEditingFlashcardId(null);
		}
	}, [open]);

	const handleEdit = (flashcard) => {
		setEditingFlashcardId(flashcard.id);
		setIsInlineAdding(false); // close add form if open
	};

	// Handle add flashcard button click with limit check
	const handleAddFlashcardClick = () => {
		// Check limit for new flashcard
		if (!canCreateFlashcard) {
			setShowLimitModal(true);
			return;
		}
		setIsInlineAdding(true);
	};

	return (
		<>
			<StyledModal
				open={open}
				onClose={onClose}
				title={t("flashcards") || "Flashcards"}
				icon={<StyleIcon sx={{ fontSize: 24, color: "white" }} />}
				maxWidth="sm"
				actions={
					<>
						<StyledButton variant="ghost" onClick={onClose}>
							{t("close") || "Close"}
						</StyledButton>
						<StyledButton
							variant="success"
							onClick={handleAddFlashcardClick}
							startIcon={<AddIcon />}
						>
							{t("add_flashcard") || "Add Card"}
						</StyledButton>
					</>
				}
			>
				{/* Search and Card count */}
				{!loading && flashcards.length > 0 && (
					<Box sx={{ mb: 2 }}>
						{/* Search Input */}
						<StyledTextField
							fullWidth
							size="small"
							placeholder={t("search_flashcards") || "Search flashcards..."}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon
											sx={{ color: "text.cardSubtitle", fontSize: 20 }}
										/>
									</InputAdornment>
								),
								endAdornment: searchQuery && (
									<InputAdornment position="end">
										<IconButton
											size="small"
											onClick={() => setSearchQuery("")}
											sx={{ color: "text.cardSubtitle" }}
										>
											<ClearIcon fontSize="small" />
										</IconButton>
									</InputAdornment>
								),
							}}
							sx={{ mb: 1.5 }}
						/>

						{/* Card count badge */}
						<MotionBox
							initial={{ y: -10 }}
							animate={{ y: 0 }}
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: 1,
								px: 2,
								py: 0.75,
								borderRadius: 2,
								background: (theme) => alpha(theme.palette.primary.main, 0.1),
								border: (theme) =>
									`1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
							}}
						>
							<Typography
								variant="caption"
								sx={{
									fontWeight: 600,
									color: "primary.main",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{searchQuery
									? `${filteredFlashcards.length} / ${flashcards.length}`
									: flashcards.length}{" "}
								{flashcards.length === 1 ? "card" : "cards"}
							</Typography>
						</MotionBox>
					</Box>
				)}

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
						<CircularProgress size={40} />
					</Box>
				) : flashcards.length === 0 && !isInlineAdding ? (
					<EmptyState
						icon={StyleIcon}
						title={t("no_flashcards") || "No flashcards yet"}
						description="Add your first flashcard to get started learning!"
						actionLabel={t("add_flashcard") || "Add Flashcard"}
						onAction={handleAddFlashcardClick}
					/>
				) : flashcards.length === 0 && isInlineAdding ? (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
						<AnimatePresence mode="sync" initial={false}>
							<InlineAddForm
								key="inline-add-empty"
								onSubmit={handleInlineAdd}
								onCancel={() => setIsInlineAdding(false)}
								loading={addLoading}
								t={t}
							/>
						</AnimatePresence>
					</Box>
				) : filteredFlashcards.length === 0 ? (
					<EmptyState
						icon={SearchIcon}
						title={t("no_results") || "No results found"}
						description={
							t("no_search_results_flashcards") ||
							"No flashcards match your search"
						}
						actionLabel={t("clear_search") || "Clear Search"}
						onAction={() => setSearchQuery("")}
					/>
				) : (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 1.5,
							maxHeight: "50vh",
							overflowY: "auto",
							overflowX: "hidden",
							pr: 1,
							"&::-webkit-scrollbar": {
								width: 6,
							},
							"&::-webkit-scrollbar-thumb": {
								backgroundColor: (theme) =>
									theme.palette.mode === "dark"
										? "rgba(255, 255, 255, 0.2)"
										: "rgba(0, 0, 0, 0.2)",
								borderRadius: 3,
							},
						}}
					>
						<AnimatePresence mode="sync" initial={false}>
							{isInlineAdding && (
								<InlineAddForm
									key="inline-add"
									onSubmit={handleInlineAdd}
									onCancel={() => setIsInlineAdding(false)}
									loading={addLoading}
									t={t}
								/>
							)}
							{filteredFlashcards.map((flashcard, index) =>
								editingFlashcardId === flashcard.id ? (
									<InlineEditForm
										key={`edit-${flashcard.id}`}
										flashcard={flashcard}
										onSubmit={handleInlineEdit}
										onCancel={() => setEditingFlashcardId(null)}
										loading={editLoading}
										t={t}
									/>
								) : (
									<FlashcardItem
										key={flashcard.id}
										flashcard={flashcard}
										onEdit={handleEdit}
										onDelete={handleDeleteFlashcard}
										index={index}
										isSearching={!!searchQuery}
									/>
								),
							)}
						</AnimatePresence>
					</Box>
				)}
			</StyledModal>

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
				warningType="flashcard"
			/>

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
