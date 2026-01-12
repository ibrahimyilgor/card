import { useState, useContext, useRef } from "react";
import {
	Box,
	Typography,
	alpha,
	useTheme,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { I18nContext } from "../../utils/i18n";
import { StyledModal, StyledTextField, StyledButton } from "../ui";

const MotionBox = motion.create(Box);

// Parse CSV content - skip first row (A1/B1 headers)
const parseCSV = (content) => {
	const lines = content.split(/\r?\n/).filter((line) => line.trim());
	if (lines.length < 2) return []; // Need at least header + 1 data row

	const flashcards = [];

	// Skip first line (header row A1/B1)
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		// Handle CSV with quotes and commas inside quotes
		const matches = line.match(
			/("([^"]*(?:""[^"]*)*)"|[^,]*),("([^"]*(?:""[^"]*)*)"|[^,]*)/
		);

		let front, back;
		if (matches) {
			front = (matches[2] || matches[1] || "").replace(/""/g, '"').trim();
			back = (matches[4] || matches[3] || "").replace(/""/g, '"').trim();
		} else {
			// Simple split for non-quoted values
			const parts = line.split(",");
			front = (parts[0] || "").trim();
			back = (parts[1] || "").trim();
		}

		if (front && back) {
			flashcards.push({ front, back });
		}
	}

	return flashcards;
};

// Parse JSON content
const parseJSON = (content) => {
	try {
		const data = JSON.parse(content);

		// Handle array format: [{front, back}, ...]
		if (Array.isArray(data)) {
			return data
				.map((item) => ({
					front: item.front || item.Front || item.FRONT || item.frontText || "",
					back: item.back || item.Back || item.BACK || item.backText || "",
				}))
				.filter((card) => card.front && card.back);
		}

		// Handle object with flashcards property: {flashcards: [...]}
		if (data.flashcards && Array.isArray(data.flashcards)) {
			return data.flashcards
				.map((item) => ({
					front: item.front || item.Front || item.FRONT || item.frontText || "",
					back: item.back || item.Back || item.BACK || item.backText || "",
				}))
				.filter((card) => card.front && card.back);
		}

		return [];
	} catch {
		return [];
	}
};

export default function ImportDeckModal({
	open,
	onClose,
	onImport,
	loading = false,
}) {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const fileInputRef = useRef(null);

	const [deckTitle, setDeckTitle] = useState("");
	const [deckDescription, setDeckDescription] = useState("");
	const [flashcards, setFlashcards] = useState([]);
	const [fileName, setFileName] = useState("");
	const [error, setError] = useState("");
	const [isDragging, setIsDragging] = useState(false);

	const resetState = () => {
		setDeckTitle("");
		setDeckDescription("");
		setFlashcards([]);
		setFileName("");
		setError("");
		setIsDragging(false);
	};

	const handleClose = () => {
		resetState();
		onClose();
	};

	const processFile = (file) => {
		if (!file) return;

		const validExtensions = [".csv", ".json"];
		const extension = file.name
			.toLowerCase()
			.substring(file.name.lastIndexOf("."));

		if (!validExtensions.includes(extension)) {
			setError(
				t("invalid_file_format") ||
					"Invalid file format. Please use CSV or JSON."
			);
			return;
		}

		setFileName(file.name);
		// Set default deck title from filename (without extension)
		const defaultTitle = file.name.replace(/\.(csv|json)$/i, "");
		setDeckTitle(defaultTitle);

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target.result;
			let parsed = [];

			if (extension === ".csv") {
				parsed = parseCSV(content);
			} else if (extension === ".json") {
				parsed = parseJSON(content);
			}

			if (parsed.length === 0) {
				setError(t("no_valid_cards") || "No valid flashcards found in file.");
				setFlashcards([]);
			} else {
				setError("");
				setFlashcards(parsed);
			}
		};

		reader.onerror = () => {
			setError(t("file_read_error") || "Error reading file.");
		};

		reader.readAsText(file, "UTF-8");
	};

	const handleFileSelect = (e) => {
		const file = e.target.files?.[0];
		processFile(file);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		processFile(file);
	};

	const handleImport = () => {
		if (!deckTitle.trim() || flashcards.length === 0) return;
		onImport(deckTitle.trim(), deckDescription.trim(), flashcards);
	};

	return (
		<StyledModal
			open={open}
			onClose={handleClose}
			title={t("import_deck") || "Import Deck"}
			icon={<UploadFileIcon sx={{ fontSize: 24, color: "white" }} />}
			maxWidth="md"
			actions={
				<>
					<StyledButton variant="ghost" onClick={handleClose}>
						{t("cancel")}
					</StyledButton>
					<StyledButton
						variant="success"
						onClick={handleImport}
						disabled={loading || !deckTitle.trim() || flashcards.length === 0}
					>
						{loading
							? t("importing") || "Importing..."
							: `${t("import") || "Import"} (${flashcards.length} ${
									t("cards") || "cards"
							  })`}
					</StyledButton>
				</>
			}
		>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
				{/* File Upload Area */}
				<Box
					onClick={() => fileInputRef.current?.click()}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					sx={{
						border: `2px dashed ${
							isDragging
								? theme.palette.primary.main
								: error
								? theme.palette.error.main
								: alpha(theme.palette.divider, 0.3)
						}`,
						borderRadius: 3,
						p: 4,
						textAlign: "center",
						cursor: "pointer",
						transition: "all 0.2s ease",
						backgroundColor: isDragging
							? alpha(theme.palette.primary.main, 0.05)
							: fileName
							? alpha(theme.palette.success.main, 0.05)
							: "transparent",
						"&:hover": {
							borderColor: theme.palette.primary.main,
							backgroundColor: alpha(theme.palette.primary.main, 0.05),
						},
					}}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept=".csv,.json"
						onChange={handleFileSelect}
						style={{ display: "none" }}
					/>

					{fileName ? (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 1,
							}}
						>
							<CheckCircleIcon
								sx={{ fontSize: 48, color: theme.palette.success.main }}
							/>
							<Typography
								variant="h6"
								sx={{ color: theme.palette.text.primary }}
							>
								{fileName}
							</Typography>
							<Chip
								label={`${flashcards.length} ${t("cards") || "cards"}`}
								color="success"
								size="small"
							/>
						</Box>
					) : (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 1,
							}}
						>
							<CloudUploadIcon
								sx={{
									fontSize: 48,
									color: alpha(theme.palette.text.secondary, 0.5),
								}}
							/>
							<Typography
								variant="h6"
								sx={{ color: theme.palette.text.primary }}
							>
								{t("drag_drop_file") || "Drag & drop file here"}
							</Typography>
							<Typography
								variant="body2"
								sx={{ color: theme.palette.text.secondary }}
							>
								{t("or_click_to_select") || "or click to select"}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: alpha(theme.palette.text.secondary, 0.7), mt: 1 }}
							>
								{t("supported_formats") || "Supported formats: CSV, JSON"}
							</Typography>
						</Box>
					)}
				</Box>

				{/* Error Message */}
				{error && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							p: 2,
							borderRadius: 2,
							backgroundColor: alpha(theme.palette.error.main, 0.1),
						}}
					>
						<ErrorIcon sx={{ color: theme.palette.error.main }} />
						<Typography sx={{ color: theme.palette.error.main }}>
							{error}
						</Typography>
					</Box>
				)}

				{/* Deck Title Input */}
				{flashcards.length > 0 && (
					<MotionBox
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
						sx={{ display: "flex", flexDirection: "column", gap: 2 }}
					>
						<StyledTextField
							label={t("deck_title") || "Deck Title"}
							value={deckTitle}
							onChange={(e) => setDeckTitle(e.target.value)}
							fullWidth
							placeholder={
								t("deck_title_placeholder") || "e.g., Spanish Vocabulary"
							}
						/>
						<StyledTextField
							label={t("deck_description") || "Deck Description"}
							value={deckDescription}
							onChange={(e) => setDeckDescription(e.target.value)}
							fullWidth
							multiline
							minRows={2}
							placeholder={
								t("deck_description_placeholder") ||
								"Optional description for your deck..."
							}
						/>
					</MotionBox>
				)}

				{/* Preview Table */}
				{flashcards.length > 0 && (
					<MotionBox
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2, delay: 0.1 }}
					>
						<Typography
							variant="subtitle2"
							sx={{ mb: 1, color: theme.palette.text.secondary }}
						>
							{t("preview") || "Preview"} (
							{t("first_5_cards") || "first 5 cards"})
						</Typography>
						<TableContainer
							component={Paper}
							sx={{
								backgroundColor: alpha(theme.palette.background.paper, 0.5),
								borderRadius: 2,
								border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
							}}
						>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell sx={{ fontWeight: 600 }}>
											{t("front_side") || "Front"}
										</TableCell>
										<TableCell sx={{ fontWeight: 600 }}>
											{t("back_side") || "Back"}
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{flashcards.slice(0, 5).map((card, index) => (
										<TableRow key={index}>
											<TableCell
												sx={{
													maxWidth: 200,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{card.front}
											</TableCell>
											<TableCell
												sx={{
													maxWidth: 200,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{card.back}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						{flashcards.length > 5 && (
							<Typography
								variant="caption"
								sx={{
									mt: 1,
									color: theme.palette.text.secondary,
									display: "block",
								}}
							>
								{t("and_more_cards", { count: flashcards.length - 5 }) ||
									`...and ${flashcards.length - 5} more cards`}
							</Typography>
						)}
					</MotionBox>
				)}
			</Box>
		</StyledModal>
	);
}
