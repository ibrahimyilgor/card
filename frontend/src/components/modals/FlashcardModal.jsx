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
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import StyleIcon from "@mui/icons-material/Style";
import AddIcon from "@mui/icons-material/Add";
import AddFlashcardModal from "./AddFlashcardModal";
import { I18nContext } from "../../utils/i18n";
import { updateFlashcard } from "../../services/flashcardServices";
import {
	StyledModal,
	StyledButton,
	StyledCard,
	EmptyState,
	StyledTextField,
} from "../ui";

const MotionBox = motion.create(Box);

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

	const [flashcards, setFlashcards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [addLoading, setAddLoading] = useState(false);
	const [error, setError] = useState("");
	const [editFlashcard, setEditFlashcard] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

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
		} catch (err) {
			console.error("Error deleting flashcard:", err);
		}
	};

	const handleAddOrUpdateFlashcard = async (front, back) => {
		setAddLoading(true);
		setError("");
		if (editFlashcard) {
			try {
				const res = await updateFlashcard(editFlashcard.id, {
					frontText: front,
					backText: back,
				});
				if (res.data && res.data.flashcard) {
					setFlashcards((prev) =>
						prev.map((f) =>
							f.id === editFlashcard.id
								? { ...f, front_text: front, back_text: back }
								: f
						)
					);
					setAddModalOpen(false);
					setEditFlashcard(null);
				} else {
					setError(res.data?.error || "Failed to update flashcard");
				}
			} catch (err) {
				setError("Network error");
			} finally {
				setAddLoading(false);
			}
		} else {
			try {
				const res = await createFlashcard({
					deckId,
					frontText: front,
					backText: back,
				});
				if (res.data && res.data.flashcard) {
					setFlashcards((prev) => [...prev, res.data.flashcard]);
					setAddModalOpen(false);
					if (onCardsChange) onCardsChange();
				} else {
					setError(res.data?.error || "Failed to add flashcard");
				}
			} catch (err) {
				setError("Network error");
			} finally {
				setAddLoading(false);
			}
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

	// Reset search query when modal closes
	useEffect(() => {
		if (!open) {
			setSearchQuery("");
		}
	}, [open]);

	const handleEdit = (flashcard) => {
		setEditFlashcard(flashcard);
		setAddModalOpen(true);
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
							onClick={() => setAddModalOpen(true)}
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
				) : flashcards.length === 0 ? (
					<EmptyState
						icon={StyleIcon}
						title={t("no_flashcards") || "No flashcards yet"}
						description="Add your first flashcard to get started learning!"
						actionLabel={t("add_flashcard") || "Add Flashcard"}
						onAction={() => setAddModalOpen(true)}
					/>
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
							{filteredFlashcards.map((flashcard, index) => (
								<FlashcardItem
									key={flashcard.id}
									flashcard={flashcard}
									onEdit={handleEdit}
									onDelete={handleDeleteFlashcard}
									index={index}
									isSearching={!!searchQuery}
								/>
							))}
						</AnimatePresence>
					</Box>
				)}
			</StyledModal>

			<AddFlashcardModal
				open={addModalOpen}
				onClose={() => {
					setAddModalOpen(false);
					setError("");
					setEditFlashcard(null);
				}}
				onSave={handleAddOrUpdateFlashcard}
				loading={addLoading}
				error={error}
				editFlashcard={editFlashcard}
			/>
		</>
	);
}
