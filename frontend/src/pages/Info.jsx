import {
	useEffect,
	useState,
	useContext,
	useMemo,
	useRef,
	forwardRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "../utils/seo";
import {
	getDecks,
	createDeck,
	updateDeck,
	deleteDeck,
	importDeck,
} from "../services/deckServices";
import { getProfile } from "../services/accountServices";
import { getFlashcards } from "../services/flashcardServices";
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
	Snackbar,
	Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import StyleIcon from "@mui/icons-material/Style";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import LayersIcon from "@mui/icons-material/Layers";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { I18nContext } from "../utils/i18n";
import DeckModal from "../components/modals/DeckModal";
import FlashcardModal from "../components/modals/FlashcardModal";
import GameSettingsModal from "../components/modals/GameSettingsModal";
import ImportDeckModal from "../components/modals/ImportDeckModal";
import {
	PageContainer,
	StyledButton,
	StyledTextField,
	StyledCard,
	EmptyState,
	CardSkeleton,
	ConfirmModal,
	LimitWarningModal,
} from "../components/ui";
import { usePlan } from "../context/PlanContext";

const MotionBox = motion.create(Box);

// Deck card component with animation
const DeckCard = forwardRef(
	(
		{
			deck,
			index,
			onEdit,
			onCards,
			onPlay,
			onDelete,
			onDownload,
			t,
			showTodaysFinishedDecks,
		},
		ref,
	) => {
		const theme = useTheme();
		const titleRef = useRef(null);
		const descRef = useRef(null);
		const [isTitleOverflow, setIsTitleOverflow] = useState(false);
		const [isDescOverflow, setIsDescOverflow] = useState(false);

		useEffect(() => {
			const checkOverflow = () => {
				if (titleRef.current) {
					setIsTitleOverflow(
						titleRef.current.scrollWidth > titleRef.current.clientWidth,
					);
				}
				if (descRef.current) {
					setIsDescOverflow(
						descRef.current.scrollWidth > descRef.current.clientWidth,
					);
				}
			};
			checkOverflow();
			window.addEventListener("resize", checkOverflow);
			return () => window.removeEventListener("resize", checkOverflow);
		}, [deck.title, deck.description]);

		return (
			<MotionBox
				ref={ref}
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.3, delay: index * 0.05 }}
				layout
				sx={{ minWidth: 0, width: "100%", overflow: "hidden", p: "2px" }}
			>
				<StyledCard
					variant="default"
					padding={0}
					isHoverColor={false}
					sx={{
						overflow: "hidden",
						height: 200,
						display: "flex",
						flexDirection: "column",
						width: "100%",
						position: "relative",
						minWidth: 0,
					}}
				>
					{/* badge removed: using top accent color to indicate status */}
					{/* Card Header with gradient accent (red by default, green if finished today) */}
					<Box
						sx={{
							height: 4,
							// Use only green-tone gradients when finished, otherwise only red-tone gradients
							background: deck.finished_today
								? "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
								: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
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
								{deck.description || ""}
							</Typography>
						</Tooltip>

						{/* Card count chip */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								mb: 2,
								flexWrap: "nowrap",
							}}
						>
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
								<Tooltip title={t("hard_mode") || "Hard Mode"} arrow>
									<Box
										sx={{
											width: 28,
											height: 28,
											borderRadius: "8px",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											bgcolor: (theme) =>
												theme.palette.mode === "dark"
													? "rgba(249, 115, 22, 0.15)"
													: "rgba(249, 115, 22, 0.1)",
											cursor: "default",
										}}
									>
										<WhatshotIcon sx={{ fontSize: 16, color: "#f97316" }} />
									</Box>
								</Tooltip>
							)}
							{deck.card_direction === "reverse" && (
								<Tooltip title={t("direction_reverse") || "Reverse"} arrow>
									<Box
										sx={{
											width: 28,
											height: 28,
											borderRadius: "8px",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											bgcolor: (theme) =>
												theme.palette.mode === "dark"
													? "rgba(6, 182, 212, 0.15)"
													: "rgba(6, 182, 212, 0.1)",
											cursor: "default",
										}}
									>
										<SwapHorizIcon sx={{ fontSize: 16, color: "#06b6d4" }} />
									</Box>
								</Tooltip>
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
							<Tooltip title={t("download_csv") || "Download CSV"} arrow>
								<IconButton
									onClick={() => onDownload(deck)}
									size="small"
									sx={{
										color: "success.main",
										"&:hover": {
											bgcolor: "rgba(34, 197, 94, 0.1)",
										},
									}}
								>
									<DownloadIcon fontSize="small" />
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
	},
);

export default function Info({ accountId, onStartGame }) {
	const DECK_SORT_STORAGE_KEY = "deckSortPreference";
	const ALLOWED_DECK_SORTS = [
		"newest",
		"oldest",
		"name",
		"name_desc",
		"cards",
		"cards_desc",
	];

	const theme = useTheme();
	const { t } = useContext(I18nContext);

	// Plan context for limit checks
	const {
		canCreateDeck,
		canPlay,
		isOverLimit,
		currentDecks,
		maxDecks,
		deckOverage,
		currentFlashcards,
		maxFlashcards,
		flashcardOverage,
		planCode,
		fetchLimitStatus,
	} = usePlan();

	// Limit warning modal state
	const [limitWarningOpen, setLimitWarningOpen] = useState(false);
	const [limitWarningTitle, setLimitWarningTitle] = useState("");

	// SEO meta tags for info/decks page
	useSEO("info");

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
	const [selectedDeckForGameTitle, setSelectedDeckForGameTitle] =
		useState(null);

	// Import modal state
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [importLoading, setImportLoading] = useState(false);

	// Delete confirmation state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deckToDelete, setDeckToDelete] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// Search and filter state
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("newest");

	useEffect(() => {
		const savedSort = localStorage.getItem(DECK_SORT_STORAGE_KEY);
		if (savedSort && ALLOWED_DECK_SORTS.includes(savedSort)) {
			setSortBy(savedSort);
		}
	}, []);

	// Preference: show today's finished decks
	const [showTodaysFinishedDecks, setShowTodaysFinishedDecks] = useState(true);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const res = await getProfile();
				const profile = res.data?.profile;
				if (profile && profile.show_todays_finished_decks !== undefined) {
					setShowTodaysFinishedDecks(profile.show_todays_finished_decks);
				}
			} catch (err) {
				console.error("Failed to load profile", err);
			}
		};
		loadProfile();
	}, []);

	useEffect(() => {
		if (ALLOWED_DECK_SORTS.includes(sortBy)) {
			localStorage.setItem(DECK_SORT_STORAGE_KEY, sortBy);
		}
	}, [sortBy]);

	// Snackbar state
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

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
					(deck.description && deck.description.toLowerCase().includes(query)),
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

			case "name_desc":
				result.sort((a, b) => b.title.localeCompare(a.title));
				break;

			case "cards":
				result.sort(
					(a, b) =>
						(parseInt(b.flashcard_count) || 0) -
						(parseInt(a.flashcard_count) || 0),
				);
				break;

			case "cards_desc":
				result.sort(
					(a, b) =>
						(parseInt(a.flashcard_count) || 0) -
						(parseInt(b.flashcard_count) || 0),
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
				prevDecks.filter((d) => d.id !== deckToDelete.id),
			);
			setDeleteModalOpen(false);
			setDeckToDelete(null);
			// Refresh limit status after deletion
			fetchLimitStatus();
			setSnackbar({
				open: true,
				message: t("deck_deleted") || "Deck deleted successfully",
				severity: "success",
			});
		} catch (err) {
			setSnackbar({
				open: true,
				message: t("delete_deck_error") || "Error deleting deck",
				severity: "error",
			});
		} finally {
			setDeleteLoading(false);
		}
	};

	// Cancel delete
	const handleCancelDelete = () => {
		setDeleteModalOpen(false);
		setDeckToDelete(null);
	};

	// Download deck as CSV
	const handleDownloadCSV = async (deck) => {
		try {
			const res = await getFlashcards(deck.id);
			const flashcards = res.data?.flashcards || [];

			if (flashcards.length === 0) {
				setSnackbar({
					open: true,
					message: t("no_flashcards") || "No flashcards to download",
					severity: "warning",
				});
				return;
			}

			// Create CSV content with BOM for Excel UTF-8 support
			const BOM = "\uFEFF";
			const frontHeader = (t("front") || "Front").toUpperCase();
			const backHeader = (t("back") || "Back").toUpperCase();
			const header = `${frontHeader},${backHeader}\n`;
			const rows = flashcards
				.map((card) => {
					// Escape quotes and wrap in quotes
					const front = `"${(card.front_text || "").replace(/"/g, '""')}"`;
					const back = `"${(card.back_text || "").replace(/"/g, '""')}"`;
					return `${front},${back}`;
				})
				.join("\n");

			const csvContent = BOM + header + rows;

			// Create download link
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${deck.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			setSnackbar({
				open: true,
				message: t("download_success") || "File downloaded successfully",
				severity: "success",
			});
		} catch (err) {
			console.error("Error downloading CSV:", err);
			setSnackbar({
				open: true,
				message: t("download_error") || "Error downloading file",
				severity: "error",
			});
		}
	};

	// Import deck from CSV/JSON
	const handleImportDeck = async (title, description, flashcards) => {
		setImportLoading(true);
		try {
			const res = await importDeck(title, description, flashcards);
			const { importedCount, skippedCount } = res.data;

			// Refresh decks list
			const decksRes = await getDecks();
			if (Array.isArray(decksRes.data.decks)) {
				setDecks(decksRes.data.decks);
			}

			setImportModalOpen(false);
			setSnackbar({
				open: true,
				message:
					t("import_success", {
						count: importedCount,
						skipped: skippedCount,
					}) ||
					`Successfully imported ${importedCount} cards${
						skippedCount > 0 ? ` (${skippedCount} skipped)` : ""
					}`,
				severity: "success",
			});
		} catch (err) {
			console.error("Error importing deck:", err);
			setSnackbar({
				open: true,
				message:
					err.response?.data?.error ||
					t("import_error") ||
					"Error importing deck",
				severity: "error",
			});
		} finally {
			setImportLoading(false);
		}
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
				const res = await getDecks();
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
				display: "block",
				overflow: "visible",
				pb: 2,
			}}
		>
			{/* Header Section */}
			<MotionBox
				initial={{ y: -10 }}
				animate={{ y: 0 }}
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
						{(() => {
							const total = decks?.length || 0;
							const filtered = filteredDecks?.length || 0;
							if (total > 0 && filtered !== total) {
								return `${filtered} / ${total} ${t("decks_total") || "decks total"}`;
							}
							return `${total} ${t("decks_total") || "decks total"}`;
						})()}
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
							endAdornment: searchQuery ? (
								<InputAdornment position="end">
									<IconButton
										size="small"
										onClick={() => setSearchQuery("")}
										aria-label={t("clear_search") || "Clear search"}
									>
										<CloseIcon
											sx={{ color: "text.cardSubtitle", fontSize: 18 }}
										/>
									</IconButton>
								</InputAdornment>
							) : null,
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
							<MenuItem value="name">{t("sort_name") || "Name (A-Z)"}</MenuItem>
							<MenuItem value="name_desc">
								{t("sort_name_desc") || "Name (Z-A)"}
							</MenuItem>
							<MenuItem value="cards">
								{t("sort_cards") || "Most Cards"}
							</MenuItem>
							<MenuItem value="cards_desc">
								{t("sort_cards_desc") || "Fewest Cards"}
							</MenuItem>
						</Select>
					</FormControl>

					<StyledButton
						variant="primary"
						startIcon={<AddIcon />}
						onClick={() => {
							if (!canCreateDeck) {
								setLimitWarningTitle(
									t("limitWarningTitle", "Deck Limit Reached"),
								);
								setLimitWarningOpen(true);
								return;
							}
							setEditDeck(null);
							setModalOpen(true);
						}}
					>
						{t("new_deck") || "New Deck"}
					</StyledButton>
					<StyledButton
						variant="secondary"
						startIcon={<UploadFileIcon />}
						onClick={() => {
							if (!canCreateDeck) {
								setLimitWarningTitle(
									t("limitWarningTitle", "Deck Limit Reached"),
								);
								setLimitWarningOpen(true);
								return;
							}
							setImportModalOpen(true);
						}}
					>
						{t("import") || "Import"}
					</StyledButton>
				</Box>
			</MotionBox>

			{/* Decks Grid */}
			<Box
				sx={{
					overflow: "visible",
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
							overflow: "hidden",
						}}
					>
						<AnimatePresence mode="popLayout">
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
										setSelectedDeckForGameTitle(d.title);
										setGameSettingsModalOpen(true);
									}}
									onDelete={handleDeleteClick}
									onDownload={handleDownloadCSV}
									t={t}
									showTodaysFinishedDecks={showTodaysFinishedDecks}
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
					if (!accountId) {
						setModalError("Please wait, account is being set up...");
						return;
					}
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
							const savedDeck = res.data?.deck;
							if (savedDeck) {
								setDecks((prevDecks) => {
									const safePrevDecks = Array.isArray(prevDecks)
										? prevDecks
										: [];

									if (editDeck) {
										return safePrevDecks.map((deck) =>
											deck.id === editDeck.id
												? {
														...deck,
														...savedDeck,
														flashcard_count:
															deck.flashcard_count ??
															savedDeck.flashcard_count ??
															0,
													}
												: deck,
										);
									}

									return [
										...safePrevDecks,
										{
											...savedDeck,
											flashcard_count: savedDeck.flashcard_count ?? 0,
										},
									];
								});
							}
							setModalOpen(false);
							setModalError("");
							// Refresh limit status after deck creation
							if (!editDeck) {
								await fetchLimitStatus();
							}
							setSnackbar({
								open: true,
								message: editDeck
									? t("deck_updated") || "Deck updated successfully"
									: t("deck_created") || "Deck created successfully",
								severity: "success",
							});
						} else {
							setModalError(t("save_deck_error") || "Error saving deck");
						}
					} catch (err) {
						setModalError(t("network_error") || "Network error");
					} finally {
						setModalLoading(false);
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
						const decksRes = await getDecks();
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
					setSelectedDeckForGameTitle(null);
				}}
				onStart={(settings) => {
					setGameSettingsModalOpen(false);
					onStartGame(selectedDeckForGame, settings, selectedDeckForGameTitle);
				}}
				deckId={selectedDeckForGame}
				deckTitle={selectedDeckForGameTitle}
			/>

			{/* Import Deck Modal */}
			<ImportDeckModal
				open={importModalOpen}
				onClose={() => setImportModalOpen(false)}
				onImport={handleImportDeck}
				loading={importLoading}
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
				icon={DeleteIcon}
				loading={deleteLoading}
			/>

			{/* Limit Warning Modal */}
			<LimitWarningModal
				open={limitWarningOpen}
				onClose={() => setLimitWarningOpen(false)}
				title={limitWarningTitle}
				currentDecks={currentDecks}
				maxDecks={maxDecks}
				deckOverage={deckOverage}
				currentFlashcards={currentFlashcards}
				maxFlashcards={maxFlashcards}
				flashcardOverage={flashcardOverage}
				planCode={planCode}
				warningType="deck"
			/>

			{/* Snackbar for notifications */}
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
		</PageContainer>
	);
}
