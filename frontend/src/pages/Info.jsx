import { useEffect, useState, useContext, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	getDecks,
	createDeck,
	updateDeck,
	deleteDeck,
} from "../services/deckServices";
import {
	Box,
	Typography,
	useTheme,
	IconButton,
	Tooltip,
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import StyleIcon from "@mui/icons-material/Style";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import LayersIcon from "@mui/icons-material/Layers";
import { I18nContext } from "../utils/i18n";
import DeckModal from "../components/modals/DeckModal";
import FlashcardModal from "../components/modals/FlashcardModal";
import GameSettingsModal from "../components/modals/GameSettingsModal";
import {
	PageContainer,
	StyledButton,
	StyledTextField,
	StyledCard,
	EmptyState,
	CardSkeleton,
	ConfirmModal,
} from "../components/ui";

const MotionBox = motion.create(Box);

// Deck card component with animation
const DeckCard = ({ deck, index, onEdit, onCards, onPlay, onDelete, t }) => {
	const theme = useTheme();
	const titleRef = useRef(null);
	const descRef = useRef(null);
	const [isTitleOverflow, setIsTitleOverflow] = useState(false);
	const [isDescOverflow, setIsDescOverflow] = useState(false);

	useEffect(() => {
		const checkOverflow = () => {
			if (titleRef.current) {
				setIsTitleOverflow(
					titleRef.current.scrollWidth > titleRef.current.clientWidth
				);
			}
			if (descRef.current) {
				setIsDescOverflow(
					descRef.current.scrollWidth > descRef.current.clientWidth
				);
			}
		};
		checkOverflow();
		window.addEventListener("resize", checkOverflow);
		return () => window.removeEventListener("resize", checkOverflow);
	}, [deck.title, deck.description]);

	return (
		<MotionBox
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
			layout
			sx={{ minWidth: 0, width: "100%", overflow: "hidden", p: "2px" }}
		>
			<StyledCard
				variant="default"
				padding={0}
				sx={{
					overflow: "hidden",
					height: 200,
					display: "flex",
					flexDirection: "column",
					width: "100%",
					minWidth: 0,
				}}
			>
				{/* Card Header with gradient accent */}
				<Box
					sx={{
						height: 4,
						background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
					}}
				/>

				<Box sx={{ p: 2.5, overflow: "hidden", flex: 1, minWidth: 0 }}>
					{/* Title and Actions Row */}
					<Box
						sx={{
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "space-between",
							mb: 1.5,
							minWidth: 0,
						}}
					>
						<Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
							<Tooltip
								title={deck.title}
								arrow
								enterDelay={500}
								disableHoverListener={!isTitleOverflow}
							>
								<Typography
									ref={titleRef}
									variant="h6"
									sx={{
										fontWeight: 600,
										color: "text.cardTitle",
										fontFamily: "Inter, sans-serif",
										textOverflow: "ellipsis",
										overflow: "hidden",
										whiteSpace: "nowrap",
										fontSize: "1.1rem",
									}}
								>
									{deck.title}
								</Typography>
							</Tooltip>
						</Box>

						{/* Quick Actions */}
						<Box sx={{ display: "flex", gap: 0.5 }}>
							<Tooltip title={t("play_deck") || "Play"} arrow>
								<IconButton
									onClick={() => onPlay(deck)}
									size="small"
									sx={{
										color: "success.main",
										bgcolor: "rgba(34, 197, 94, 0.1)",
										"&:hover": {
											bgcolor: "rgba(34, 197, 94, 0.2)",
											transform: "scale(1.1)",
										},
										transition: "all 0.2s",
									}}
								>
									<PlayArrowIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>

					{/* Description */}
					<Tooltip
						title={deck.description || ""}
						arrow
						enterDelay={500}
						disableHoverListener={!isDescOverflow}
					>
						<Typography
							ref={descRef}
							variant="body2"
							sx={{
								color: "text.cardSubtitle",
								fontFamily: "Inter, sans-serif",
								textOverflow: "ellipsis",
								overflow: "hidden",
								whiteSpace: "nowrap",
								mb: 2,
								minHeight: "1.5em",
							}}
						>
							{deck.description || t("no_description") || "No description"}
						</Typography>
					</Tooltip>

					{/* Card count chip */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
						<Chip
							icon={<StyleIcon sx={{ fontSize: 16 }} />}
							label={`${deck.flashcard_count || 0} ${t("cards") || "cards"}`}
							size="small"
							sx={{
								bgcolor: (theme) =>
									theme.palette.mode === "dark"
										? "rgba(59, 130, 246, 0.15)"
										: "rgba(59, 130, 246, 0.1)",
								color: "primary.light",
								fontWeight: 500,
								fontFamily: "Inter, sans-serif",
								"& .MuiChip-icon": {
									color: "primary.light",
								},
							}}
						/>
						{deck.difficulty_enabled && (
							<Chip
								label={t("difficulty_mode") || "Difficulty"}
								size="small"
								sx={{
									bgcolor: (theme) =>
										theme.palette.mode === "dark"
											? "rgba(139, 92, 246, 0.15)"
											: "rgba(139, 92, 246, 0.1)",
									color: "secondary.light",
									fontWeight: 500,
									fontFamily: "Inter, sans-serif",
								}}
							/>
						)}
					</Box>

					{/* Action Buttons */}
					<Box
						sx={{
							display: "flex",
							gap: 1,
							pt: 1,
							borderTop: (theme) => `1px solid ${theme.palette.divider}`,
						}}
					>
						<Tooltip title={t("edit_deck") || "Edit"} arrow>
							<IconButton
								onClick={() => onEdit(deck)}
								size="small"
								sx={{
									color: "warning.main",
									"&:hover": {
										bgcolor: "rgba(251, 191, 36, 0.1)",
									},
								}}
							>
								<EditIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title={t("manage_flashcards") || "Cards"} arrow>
							<IconButton
								onClick={() => onCards(deck)}
								size="small"
								sx={{
									color: "primary.light",
									"&:hover": {
										bgcolor: "rgba(59, 130, 246, 0.1)",
									},
								}}
							>
								<StyleIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Box sx={{ flex: 1 }} />
						<Tooltip title={t("delete_deck") || "Delete"} arrow>
							<IconButton
								onClick={() => onDelete(deck)}
								size="small"
								sx={{
									color: "error.main",
									"&:hover": {
										bgcolor: "rgba(239, 68, 68, 0.1)",
									},
								}}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Box>
				</Box>
			</StyledCard>
		</MotionBox>
	);
};

export default function Info({ accountId, onStartGame }) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const [decks, setDecks] = useState(null);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);
	const [modalError, setModalError] = useState("");
	const [editDeck, setEditDeck] = useState(null);
	const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
	const [selectedDeck, setSelectedDeck] = useState(null);
	const [gameSettingsModalOpen, setGameSettingsModalOpen] = useState(false);
	const [selectedDeckForGame, setSelectedDeckForGame] = useState(null);

	// Delete confirmation state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deckToDelete, setDeckToDelete] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// Search and filter state
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("newest");

	// Filter and sort decks
	const filteredDecks = useMemo(() => {
		if (!decks) return [];

		let result = [...decks];

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(deck) =>
					deck.title.toLowerCase().includes(query) ||
					(deck.description && deck.description.toLowerCase().includes(query))
			);
		}

		// Sort
		switch (sortBy) {
			case "newest":
				result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
				break;
			case "oldest":
				result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
				break;
			case "name":
				result.sort((a, b) => a.title.localeCompare(b.title));
				break;
			case "cards":
				result.sort(
					(a, b) => (b.flashcards?.length || 0) - (a.flashcards?.length || 0)
				);
				break;
			default:
				break;
		}

		return result;
	}, [decks, searchQuery, sortBy]);

	// Open delete confirmation modal
	const handleDeleteClick = (deck) => {
		setDeckToDelete(deck);
		setDeleteModalOpen(true);
	};

	// Confirm delete
	const handleConfirmDelete = async () => {
		if (!deckToDelete) return;

		setDeleteLoading(true);
		try {
			await deleteDeck(deckToDelete.id);
			setDecks((prevDecks) =>
				prevDecks.filter((d) => d.id !== deckToDelete.id)
			);
			setDeleteModalOpen(false);
			setDeckToDelete(null);
		} catch (err) {
			alert(t("delete_deck_error") || "Error deleting deck");
		} finally {
			setDeleteLoading(false);
		}
	};

	// Cancel delete
	const handleCancelDelete = () => {
		setDeleteModalOpen(false);
		setDeckToDelete(null);
	};

	useEffect(() => {
		const fetchDecksList = async () => {
			setLoading(true);
			try {
				if (!accountId) {
					setDecks([]);
					setLoading(false);
					return;
				}
				const res = await getDecks(accountId);
				if (Array.isArray(res.data.decks)) {
					setDecks(res.data.decks);
				} else {
					setDecks([]);
				}
			} catch {
				setDecks([]);
			} finally {
				setLoading(false);
			}
		};
		fetchDecksList();
	}, [accountId]);

	return (
		<PageContainer
			maxWidth="1400px"
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				pb: 2,
			}}
		>
			{/* Header Section */}
			<MotionBox
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					alignItems: { xs: "stretch", md: "center" },
					justifyContent: "space-between",
					gap: 2,
					mb: 3,
				}}
			>
				{/* Title */}
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
						<LayersIcon sx={{ color: "primary.light", fontSize: 32 }} />
						{t("my_decks") || "My Decks"}
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: "text.cardSubtitle",
							mt: 0.5,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{decks?.length || 0} {t("decks_total") || "decks total"}
					</Typography>
				</Box>

				{/* Search and Filter */}
				<Box
					sx={{
						display: "flex",
						gap: 2,
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<StyledTextField
						placeholder={t("search_decks") || "Search decks..."}
						size="small"
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
						}}
						sx={{ width: { xs: "100%", sm: 250 } }}
					/>

					<FormControl size="small" sx={{ minWidth: 140, height: 44.5 }}>
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
								height: "44.5px",
								"& .MuiSelect-select": {
									display: "flex",
									alignItems: "center",
									py: 0,
									px: 1,
								},
								"& .MuiSelect-icon": {
									// icon dikey ortalanmış olur
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
							<MenuItem value="newest">{t("sort_newest") || "Newest"}</MenuItem>
							<MenuItem value="oldest">{t("sort_oldest") || "Oldest"}</MenuItem>
							<MenuItem value="name">{t("sort_name") || "Name"}</MenuItem>
							<MenuItem value="cards">
								{t("sort_cards") || "Most Cards"}
							</MenuItem>
						</Select>
					</FormControl>

					<StyledButton
						variant="primary"
						startIcon={<AddIcon />}
						onClick={() => {
							setEditDeck(null);
							setModalOpen(true);
						}}
					>
						{t("new_deck") || "New Deck"}
					</StyledButton>
				</Box>
			</MotionBox>

			{/* Decks Grid */}
			<Box
				sx={{
					flex: 1,
					overflow: "auto",

					"&::-webkit-scrollbar": { width: 8 },
					"&::-webkit-scrollbar-thumb": {
						bgcolor: "rgba(255, 255, 255, 0.1)",
						borderRadius: 4,
					},
				}}
			>
				{loading ? (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								lg: "repeat(3, 1fr)",
								xl: "repeat(4, 1fr)",
							},
							gap: 3,
						}}
					>
						<CardSkeleton count={8} />
					</Box>
				) : !decks || decks.length === 0 ? (
					<EmptyState
						icon={LayersIcon}
						title={t("no_decks_yet") || "No decks yet"}
						description={
							t("create_first_deck_desc") ||
							"Create your first deck to start learning with flashcards"
						}
						actionLabel={t("create_deck") || "Create Deck"}
						onAction={() => {
							setEditDeck(null);
							setModalOpen(true);
						}}
					/>
				) : filteredDecks.length === 0 ? (
					<EmptyState
						icon={SearchIcon}
						title={t("no_results") || "No results found"}
						description={
							t("no_results_desc") || "Try adjusting your search or filters"
						}
						actionLabel={t("clear_search") || "Clear Search"}
						onAction={() => setSearchQuery("")}
					/>
				) : (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								lg: "repeat(3, 1fr)",
								xl: "repeat(4, 1fr)",
							},
							gap: 3,
						}}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							{filteredDecks.map((deck, index) => (
								<DeckCard
									key={deck.id}
									deck={deck}
									index={index}
									onEdit={(d) => {
										setEditDeck(d);
										setModalOpen(true);
									}}
									onCards={(d) => {
										setSelectedDeck(d);
										setFlashcardModalOpen(true);
									}}
									onPlay={(d) => {
										setSelectedDeckForGame(d.id);
										setGameSettingsModalOpen(true);
									}}
									onDelete={handleDeleteClick}
									t={t}
								/>
							))}
						</AnimatePresence>
					</Box>
				)}
			</Box>

			{/* Modals */}
			<DeckModal
				open={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setModalError("");
				}}
				editDeck={editDeck}
				onSave={async (title, desc, settings) => {
					setModalLoading(true);
					setModalError("");
					try {
						let res;
						if (editDeck) {
							res = await updateDeck(editDeck.id, {
								title,
								description: desc,
								difficulty_enabled: settings.difficulty_enabled,
								mode: settings.mode,
							});
						} else {
							res = await createDeck({
								accountId,
								title,
								description: desc,
								difficulty_enabled: settings.difficulty_enabled,
								mode: settings.mode,
							});
						}
						if (res.status === 200 || res.status === 201) {
							setModalOpen(false);
							setModalError("");
							setLoading(true);
							const decksRes = await getDecks(accountId);
							setDecks(decksRes.data.decks || []);
						} else {
							setModalError("Error saving deck");
						}
					} catch (err) {
						setModalError("Network error");
					} finally {
						setModalLoading(false);
						setLoading(false);
					}
				}}
				initialTitle={editDeck ? editDeck.title : ""}
				initialDesc={editDeck ? editDeck.description : ""}
				loading={modalLoading}
				error={modalError}
			/>
			<FlashcardModal
				open={flashcardModalOpen}
				onClose={() => {
					setFlashcardModalOpen(false);
					setSelectedDeck(null);
				}}
				deckId={selectedDeck?.id}
				deckTitle={selectedDeck?.title}
				onCardsChange={async () => {
					try {
						const decksRes = await getDecks(accountId);
						setDecks(decksRes.data.decks || []);
					} catch (err) {
						console.error("Error refreshing decks:", err);
					}
				}}
			/>
			<GameSettingsModal
				open={gameSettingsModalOpen}
				onClose={() => {
					setGameSettingsModalOpen(false);
					setSelectedDeckForGame(null);
				}}
				onStart={(settings) => {
					setGameSettingsModalOpen(false);
					onStartGame(selectedDeckForGame, settings);
				}}
				deckId={selectedDeckForGame}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				open={deleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("delete_deck") || "Delete Deck"}
				itemName={deckToDelete?.title}
				message={
					(t("delete_deck_confirm") ||
						"Are you sure you want to delete this deck?") +
					" " +
					(t("delete_deck_warning") ||
						"This action cannot be undone and all flashcards will be permanently deleted.")
				}
				confirmText={t("delete") || "Delete"}
				cancelText={t("cancel") || "Cancel"}
				variant="danger"
				loading={deleteLoading}
			/>
		</PageContainer>
	);
}
