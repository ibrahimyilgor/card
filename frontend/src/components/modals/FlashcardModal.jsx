import React, {
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from "react";
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
	FormControl,
	Select,
	MenuItem,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import StyleIcon from "@mui/icons-material/Style";
import SortIcon from "@mui/icons-material/Sort";
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
const ALLOWED_FLASHCARD_SORTS = ["newest", "oldest", "name_asc", "name_desc"];

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
function FlashcardItem({
	flashcard,
	onEdit,
	onDelete,
	onToggleEnabled,
	index,
	isSearching,
	isLastItem,
	onLastItemHover,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const [isExpanded, setIsExpanded] = useState(false);

	const frontLong = flashcard.front_text.length > 50;
	const backLong = flashcard.back_text.length > 50;
	const hasLongContent = frontLong || backLong;

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
			onMouseEnter={() => {
				if (isLastItem) onLastItemHover?.();
			}}
		>
			<StyledCard
				variant="default"
				sx={{
					marginBottom: "1px",
					p: 0,
					overflow: "hidden",
					opacity: flashcard.enabled ? 1 : 0.62,
					filter: flashcard.enabled ? "none" : "grayscale(18%)",
					borderColor: flashcard.enabled
						? undefined
						: (theme) => alpha(theme.palette.grey[500], 0.28),
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
							backgroundColor: flashcard.enabled
								? "transparent"
								: (theme) => alpha(theme.palette.grey[500], 0.08),
						}}
					>
						<Box
							sx={{
								flex: 1,
								minWidth: 0,
								overflow: "hidden",
								cursor: hasLongContent ? "pointer" : "default",
							}}
							onClick={() => hasLongContent && setIsExpanded((p) => !p)}
						>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 600,
									color: "text.cardTitle",
									fontFamily: "Inter, sans-serif",
									overflow: isExpanded ? "visible" : "hidden",
									textOverflow: isExpanded ? "unset" : "ellipsis",
									whiteSpace: isExpanded ? "normal" : "nowrap",
									wordBreak: isExpanded ? "break-word" : "normal",
								}}
							>
								{flashcard.front_text}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: "text.cardSubtitle",
									fontFamily: "Inter, sans-serif",
									fontSize: "0.85rem",
									overflow: isExpanded ? "visible" : "hidden",
									textOverflow: isExpanded ? "unset" : "ellipsis",
									whiteSpace: isExpanded ? "normal" : "nowrap",
									wordBreak: isExpanded ? "break-word" : "normal",
									mt: 0.5,
								}}
							>
								{flashcard.back_text}
							</Typography>
						</Box>

						{/* Actions */}
						<Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
							<Tooltip
								title={
									flashcard.enabled
										? t("disable_flashcard") || "Disable"
										: t("enable_flashcard") || "Enable"
								}
								arrow
							>
								<IconButton
									size="small"
									onClick={() => onToggleEnabled(flashcard)}
									sx={{
										color: flashcard.enabled ? "primary.main" : "text.disabled",
										transition: "all 0.2s",
										"&:hover": {
											backgroundColor: (theme) =>
												alpha(theme.palette.primary.main, 0.1),
											transform: "scale(1.1)",
										},
									}}
								>
									{flashcard.enabled ? (
										<VisibilityIcon fontSize="small" />
									) : (
										<VisibilityOffIcon fontSize="small" />
									)}
								</IconButton>
							</Tooltip>
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
	const [bulkLoading, setBulkLoading] = useState(false);
	const [isInlineAdding, setIsInlineAdding] = useState(false);
	const [editingFlashcardId, setEditingFlashcardId] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("newest");
	const [showLimitModal, setShowLimitModal] = useState(false);
	const listRef = useRef(null);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const scrollListToBottom = useCallback(() => {
		const node = listRef.current;
		if (!node) return;
		node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
	}, []);

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

	const sortedFlashcards = [...filteredFlashcards].sort((a, b) => {
		switch (sortBy) {
			case "oldest":
				return new Date(a.created_at) - new Date(b.created_at);
			case "name_asc":
				return (a.front_text || "").localeCompare(b.front_text || "");
			case "name_desc":
				return (b.front_text || "").localeCompare(a.front_text || "");
			case "newest":
			default:
				return new Date(b.created_at) - new Date(a.created_at);
		}
	});

	const enabledCount = flashcards.filter(
		(flashcard) => flashcard.enabled,
	).length;
	const disabledCount = flashcards.length - enabledCount;
	const filteredEnabledCount = filteredFlashcards.filter(
		(flashcard) => flashcard.enabled,
	).length;
	const filteredDisabledCount =
		filteredFlashcards.length - filteredEnabledCount;
	const isSearching = Boolean(searchQuery.trim());

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

	const handleToggleFlashcardEnabled = async (flashcard) => {
		try {
			const nextEnabled = !flashcard.enabled;
			const res = await updateFlashcard(flashcard.id, { enabled: nextEnabled });
			const updatedEnabled =
				typeof res?.data?.flashcard?.enabled === "boolean"
					? res.data.flashcard.enabled
					: nextEnabled;

			setFlashcards((prev) =>
				prev.map((f) =>
					f.id === flashcard.id ? { ...f, enabled: updatedEnabled } : f,
				),
			);
			setSnackbar({
				open: true,
				message: updatedEnabled
					? t("flashcard_enabled") || "Flashcard enabled"
					: t("flashcard_disabled") || "Flashcard disabled",
				severity: "success",
			});
		} catch (err) {
			setSnackbar({
				open: true,
				message:
					err?.response?.data?.error ||
					t("flashcard_error") ||
					"Error updating flashcard",
				severity: "error",
			});
		}
	};

	const handleBulkSetEnabled = async (nextEnabled) => {
		const targetFlashcards = filteredFlashcards.filter(
			(flashcard) => flashcard.enabled !== nextEnabled,
		);

		if (targetFlashcards.length === 0) {
			setSnackbar({
				open: true,
				message: nextEnabled
					? t("all_cards_already_enabled") ||
						"Selected cards are already enabled"
					: t("all_cards_already_disabled") ||
						"Selected cards are already disabled",
				severity: "success",
			});
			return;
		}

		setBulkLoading(true);
		try {
			await Promise.all(
				targetFlashcards.map((flashcard) =>
					updateFlashcard(flashcard.id, { enabled: nextEnabled }),
				),
			);

			const targetIds = new Set(
				targetFlashcards.map((flashcard) => flashcard.id),
			);
			setFlashcards((prev) =>
				prev.map((flashcard) =>
					targetIds.has(flashcard.id)
						? { ...flashcard, enabled: nextEnabled }
						: flashcard,
				),
			);

			setSnackbar({
				open: true,
				message: nextEnabled
					? t("all_selected_cards_enabled") || "Selected cards enabled"
					: t("all_selected_cards_disabled") || "Selected cards disabled",
				severity: "success",
			});
		} catch (err) {
			setSnackbar({
				open: true,
				message:
					err?.response?.data?.error ||
					t("flashcard_error") ||
					"Error updating flashcards",
				severity: "error",
			});
		} finally {
			setBulkLoading(false);
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

	useEffect(() => {
		if (!open || !deckId) return;
		const sortStorageKey = `flashcardSortPreference_${deckId}`;
		const savedSort = localStorage.getItem(sortStorageKey);
		if (savedSort && ALLOWED_FLASHCARD_SORTS.includes(savedSort)) {
			setSortBy(savedSort);
			return;
		}
		setSortBy("newest");
	}, [deckId, open]);

	useEffect(() => {
		if (!deckId || !ALLOWED_FLASHCARD_SORTS.includes(sortBy)) return;
		const sortStorageKey = `flashcardSortPreference_${deckId}`;
		localStorage.setItem(sortStorageKey, sortBy);
	}, [deckId, sortBy]);

	// Reset search query and inline states when modal closes
	useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setIsInlineAdding(false);
			setEditingFlashcardId(null);
			setSortBy("newest");
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
				title={deckTitle || t("flashcards") || "Flashcards"}
				icon={<StyleIcon sx={{ fontSize: 24, color: "white" }} />}
				maxWidth={760}
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
						<Box
							sx={{
								display: "flex",
								gap: 1,
								alignItems: "center",
								mb: 1.5,
							}}
						>
							<StyledTextField
								fullWidth
								size="small"
								placeholder={t("search_flashcards") || "Search flashcards..."}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								sx={{
									"& .MuiOutlinedInput-root": {
										height: 40,
									},
								}}
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
							/>

							<FormControl
								size="small"
								sx={{ minWidth: 170, height: 40, flexShrink: 0 }}
							>
								<Select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									displayEmpty
									startAdornment={
										<SortIcon
											sx={{ color: "text.cardSubtitle", mr: 1, fontSize: 18 }}
										/>
									}
									sx={{
										borderRadius: "12px",
										fontFamily: "Inter, sans-serif",
										fontSize: "0.875rem",
										height: "40px",
										"& .MuiSelect-select": {
											display: "flex",
											alignItems: "center",
											py: 0,
											px: 1,
										},
										"& .MuiSelect-icon": {
											top: "50%",
											transform: "translateY(-50%)",
										},
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: (theme) =>
												theme.palette.mode === "dark"
													? "rgba(255, 255, 255, 0.1)"
													: "rgba(0, 0, 0, 0.1)",
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: "primary.main",
										},
									}}
								>
									<MenuItem value="newest">
										{t("sort_newest") || "Newest"}
									</MenuItem>
									<MenuItem value="oldest">
										{t("sort_oldest") || "Oldest"}
									</MenuItem>
									<MenuItem value="name_asc">
										{t("sort_name") || "Name (A-Z)"}
									</MenuItem>
									<MenuItem value="name_desc">
										{t("sort_name_desc") || "Name (Z-A)"}
									</MenuItem>
								</Select>
							</FormControl>
						</Box>

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: 1,
								flexWrap: "wrap",
							}}
						>
							{/* Card count badges */}
							<MotionBox
								initial={{ y: -10 }}
								animate={{ y: 0 }}
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									flexWrap: "wrap",
								}}
							>
								<Box
									sx={{
										display: "inline-flex",
										alignItems: "center",
										px: 2,
										py: 0.75,
										borderRadius: 2,
										background: (theme) =>
											alpha(theme.palette.primary.main, 0.1),
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
										{isSearching
											? `${filteredFlashcards.length}/${flashcards.length}`
											: flashcards.length}{" "}
										{t("cards_flashcard_count")}
									</Typography>
								</Box>

								<Box
									sx={{
										display: "inline-flex",
										alignItems: "center",
										px: 2,
										py: 0.75,
										borderRadius: 2,
										background: (theme) =>
											alpha(theme.palette.success.main, 0.12),
										border: (theme) =>
											`1px solid ${alpha(theme.palette.success.main, 0.28)}`,
									}}
								>
									<Typography
										variant="caption"
										sx={{
											fontWeight: 600,
											color: "success.main",
											fontFamily: "Inter, sans-serif",
										}}
									>
										{isSearching
											? `${filteredEnabledCount}/${filteredFlashcards.length}`
											: enabledCount}{" "}
										{t("enabled") || "enabled"}
									</Typography>
								</Box>

								<Box
									sx={{
										display: "inline-flex",
										alignItems: "center",
										px: 2,
										py: 0.75,
										borderRadius: 2,
										background: (theme) =>
											alpha(theme.palette.error.main, 0.12),
										border: (theme) =>
											`1px solid ${alpha(theme.palette.error.main, 0.28)}`,
									}}
								>
									<Typography
										variant="caption"
										sx={{
											fontWeight: 600,
											color: "error.main",
											fontFamily: "Inter, sans-serif",
										}}
									>
										{isSearching
											? `${filteredDisabledCount}/${filteredFlashcards.length}`
											: disabledCount}{" "}
										{t("disabled") || "disabled"}
									</Typography>
								</Box>
							</MotionBox>

							{/* Bulk enable/disable actions */}
							<Box
								sx={{ display: "flex", gap: 1, flexWrap: "wrap", ml: "auto" }}
							>
								<StyledButton
									variant="success"
									size="small"
									onClick={() => handleBulkSetEnabled(true)}
									disabled={bulkLoading || filteredFlashcards.length === 0}
									sx={{ px: 1.5, py: 0.4, minHeight: 30, fontSize: "0.76rem" }}
								>
									{t("enable_all") || "Enable all"}
								</StyledButton>
								<StyledButton
									variant="ghost"
									size="small"
									onClick={() => handleBulkSetEnabled(false)}
									disabled={bulkLoading || filteredFlashcards.length === 0}
									sx={{
										px: 1.5,
										py: 0.4,
										minHeight: 30,
										fontSize: "0.76rem",
										backgroundColor: "error.main",
										color: "common.white",
										borderColor: "error.main",
										"&:hover": {
											backgroundColor: "error.dark",
											borderColor: "error.dark",
										},
									}}
								>
									{t("disable_all") || "Disable all"}
								</StyledButton>
							</Box>
						</Box>
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
						description={t("add_flashcard_desc")}
						// actionLabel={t("add_flashcard") || "Add Flashcard"}
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
						ref={listRef}
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
							{sortedFlashcards.map((flashcard, index) =>
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
										onToggleEnabled={handleToggleFlashcardEnabled}
										index={index}
										isSearching={!!searchQuery}
										isLastItem={index === sortedFlashcards.length - 1}
										onLastItemHover={scrollListToBottom}
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
