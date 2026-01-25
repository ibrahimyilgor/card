import { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
	Box,
	Typography,
	useTheme,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	LinearProgress,
	Tooltip,
	IconButton,
	TableSortLabel,
	Button,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip as ChartTooltip,
	Legend,
	Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StyleIcon from "@mui/icons-material/Style";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import ErrorIcon from "@mui/icons-material/Error";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import LockIcon from "@mui/icons-material/Lock";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { I18nContext } from "../utils/i18n";
import { PageContainer, StyledCard, StatsSkeleton } from "../components/ui";
import { usePlan } from "../context/PlanContext";
import {
	getDecksStats,
	getFilteredStats,
	getChartData,
	getCardsTable,
} from "../services/statsServices";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	ChartTooltip,
	Legend,
	Filler,
);

const MotionBox = motion.create(Box);

// Date preset buttons data
const DATE_PRESETS = [
	{ key: "today", days: 0 },
	{ key: "7d", days: 7 },
	{ key: "30d", days: 30 },
	{ key: "90d", days: 90 },
];

// Stats card component
const StatCard = ({ icon: Icon, title, value, subtitle, color, delay = 0 }) => (
	<MotionBox
		initial={{ y: 20, opacity: 0 }}
		animate={{ y: 0, opacity: 1 }}
		transition={{ duration: 0.4, delay }}
	>
		<StyledCard variant="default" padding={3}>
			<Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
				<Box
					sx={{
						width: 48,
						height: 48,
						borderRadius: "12px",
						background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					<Icon sx={{ color: color, fontSize: 24 }} />
				</Box>
				<Box sx={{ flex: 1 }}>
					<Typography
						variant="body2"
						sx={{
							color: "text.cardSubtitle",
							fontFamily: "Inter, sans-serif",
							fontWeight: 500,
							mb: 0.5,
						}}
					>
						{title}
					</Typography>
					<Typography
						variant="h4"
						sx={{
							color: "text.cardTitle",
							fontWeight: 700,
							fontFamily: "Inter, sans-serif",
						}}
					>
						{value}
					</Typography>
					{subtitle && (
						<Typography
							variant="caption"
							sx={{
								color: "text.cardSubtitle",
								fontFamily: "Inter, sans-serif",
							}}
						>
							{subtitle}
						</Typography>
					)}
				</Box>
			</Box>
		</StyledCard>
	</MotionBox>
);

// Preset button component
const PresetButton = ({ label, active, onClick }) => (
	<Box
		onClick={onClick}
		sx={{
			px: 2,
			py: 0.75,
			borderRadius: "8px",
			cursor: "pointer",
			fontFamily: "Inter, sans-serif",
			fontSize: 13,
			fontWeight: 500,
			transition: "all 0.2s",
			bgcolor: active ? "primary.main" : "action.hover",
			color: active ? "white" : "text.cardSubtitle",
			"&:hover": {
				bgcolor: active ? "primary.dark" : "action.selected",
			},
		}}
	>
		{label}
	</Box>
);

export default function Stats() {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const navigate = useNavigate();

	// Plan context for access control
	const { advancedStats, planCode, loading: planLoading } = usePlan();

	// Filter states
	const [selectedDeck, setSelectedDeck] = useState("all");
	const [dateRange, setDateRange] = useState([null, null]);
	const [activePreset, setActivePreset] = useState("30d");

	// Data states
	const [loading, setLoading] = useState(true);
	const [decksData, setDecksData] = useState([]);
	const [filteredStats, setFilteredStats] = useState(null);
	const [chartData, setChartData] = useState({ data: [], grouping: "daily" });
	const [cardsTable, setCardsTable] = useState([]);

	// Table sorting
	const [sortBy, setSortBy] = useState("times_played");
	const [sortOrder, setSortOrder] = useState("desc");

	// If user doesn't have advanced stats access, show upgrade prompt
	if (!planLoading && !advancedStats) {
		return (
			<PageContainer centered>
				<MotionBox
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3 }}
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 3,
						textAlign: "center",
						maxWidth: 450,
						p: 4,
					}}
				>
					<Box
						sx={{
							width: 100,
							height: 100,
							borderRadius: "24px",
							background:
								"linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<LockIcon sx={{ fontSize: 48, color: "warning.main" }} />
					</Box>
					<Typography
						variant="h4"
						sx={{
							fontWeight: 700,
							color: "text.cardTitle",
							fontFamily: "Inter, sans-serif",
						}}
					>
						{t("stats_locked_title", "Statistics Locked")}
					</Typography>
					<Typography
						variant="body1"
						sx={{
							color: "text.cardSubtitle",
							fontFamily: "Inter, sans-serif",
						}}
					>
						{t(
							"stats_locked_description",
							"Advanced statistics are available for Pro and Premium plan users. Upgrade your plan to access detailed insights, charts, and performance tracking.",
						)}
					</Typography>
					<Box sx={{ display: "flex", gap: 2, mt: 2 }}>
						<Button
							variant="contained"
							color="primary"
							startIcon={<UpgradeIcon />}
							onClick={() => navigate("/plans")}
							sx={{
								py: 1.5,
								px: 4,
								fontWeight: 600,
								borderRadius: 2,
							}}
						>
							{t("upgrade_plan", "Upgrade Plan")}
						</Button>
						<Button
							variant="outlined"
							onClick={() => navigate("/")}
							sx={{
								py: 1.5,
								px: 3,
								borderRadius: 2,
							}}
						>
							{t("back_to_decks", "Back to Decks")}
						</Button>
					</Box>
					<Typography variant="caption" sx={{ color: "text.disabled", mt: 1 }}>
						{t("current_plan", "Current plan")}:{" "}
						{planCode?.charAt(0).toUpperCase() + planCode?.slice(1)}
					</Typography>
				</MotionBox>
			</PageContainer>
		);
	}

	// Chart colors from theme
	const chartColors = useMemo(
		() =>
			theme.palette.chart || {
				primary: "#3b82f6",
				secondary: "#8b5cf6",
				success: "#22c55e",
				error: "#ef4444",
				warning: "#f59e0b",
				info: "#06b6d4",
				grid: "rgba(255, 255, 255, 0.06)",
				text: "#94a3b8",
			},
		[theme.palette.chart],
	);

	// Format duration helper
	const formatDuration = useCallback((seconds) => {
		if (!seconds) return "0m";
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	}, []);

	// Format date for display
	const formatDateLabel = useCallback((dateStr, grouping) => {
		if (!dateStr) return "-";
		const date = new Date(dateStr);
		if (grouping === "monthly") {
			return date.toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
			});
		}
		return date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		});
	}, []);

	// Calculate date range from preset
	const getDateRangeFromPreset = useCallback((preset) => {
		const today = dayjs();

		if (preset === "all") {
			return [null, null];
		}

		const days = DATE_PRESETS.find((p) => p.key === preset)?.days;
		if (days === undefined) return [null, null];

		if (days === 0) {
			// Today
			return [today, today];
		}

		return [today.subtract(days, "day"), today];
	}, []);

	// Handle preset click
	const handlePresetClick = useCallback(
		(preset) => {
			setActivePreset(preset);
			const range = getDateRangeFromPreset(preset);
			setDateRange(range);
		},
		[getDateRangeFromPreset],
	);

	// Handle date picker change
	const handleDatePickerChange = useCallback((type, value) => {
		setActivePreset(null); // Clear preset when manually changing dates
		setDateRange((prev) => {
			if (type === "start") {
				return [value, prev[1]];
			} else {
				return [prev[0], value];
			}
		});
	}, []);

	// Fetch decks list (for dropdown)
	useEffect(() => {
		const fetchDecks = async () => {
			try {
				const res = await getDecksStats();
				setDecksData(res.decks || []);
			} catch (err) {
				console.error("Failed to fetch decks:", err);
			}
		};
		fetchDecks();
	}, []);

	// Initialize with 30d preset
	useEffect(() => {
		handlePresetClick("30d");
	}, [handlePresetClick]);

	// Fetch filtered data when filters change
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const startStr = dateRange[0]
					? dateRange[0].format("YYYY-MM-DD")
					: null;
				const endStr = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : null;

				const [statsRes, chartRes, cardsRes] = await Promise.all([
					getFilteredStats(selectedDeck, startStr, endStr),
					getChartData(selectedDeck, startStr, endStr),
					getCardsTable(selectedDeck, sortBy, sortOrder),
				]);

				setFilteredStats(statsRes);
				setChartData(chartRes);
				setCardsTable(cardsRes.cards || []);
			} catch (err) {
				console.error("Failed to fetch stats:", err);
			} finally {
				setLoading(false);
			}
		};

		// Fetch if we have valid date range or if both are null (all time)
		if (
			(dateRange[0] && dateRange[1]) ||
			(!dateRange[0] && !dateRange[1]) ||
			activePreset
		) {
			fetchData();
		}
	}, [selectedDeck, dateRange, sortBy, sortOrder, activePreset]);

	// Handle sort change
	const handleSort = useCallback(
		(column) => {
			if (sortBy === column) {
				setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
			} else {
				setSortBy(column);
				setSortOrder("desc");
			}
		},
		[sortBy],
	);

	// Refresh data
	const handleRefresh = useCallback(() => {
		if (activePreset) {
			handlePresetClick(activePreset);
		}
	}, [activePreset, handlePresetClick]);

	// Download report as PDF file
	const handleDownloadReport = useCallback(async () => {
		if (!filteredStats) return;

		const total = (filteredStats.correct || 0) + (filteredStats.incorrect || 0);
		const accuracyPercent =
			total > 0 ? Math.round((filteredStats.correct / total) * 100) : 0;
		const hours = Math.floor((filteredStats.studyTimeSeconds || 0) / 3600);
		const minutes = Math.floor(
			((filteredStats.studyTimeSeconds || 0) % 3600) / 60,
		);
		const studyTimeFormatted =
			hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

		const dateRangeText =
			dateRange[0] && dateRange[1]
				? `${dateRange[0].format("DD/MM/YYYY")} - ${dateRange[1].format("DD/MM/YYYY")}`
				: t("all_time") || "All Time";

		const selectedDeckName =
			selectedDeck === "all"
				? t("all_decks") || "All Decks"
				: decksData.find((d) => d.id === selectedDeck)?.title || selectedDeck;

		const reportDate = dayjs().format("DD/MM/YYYY HH:mm");

		// Get chart images as base64 using ChartJS.getChart()
		const getChartImage = (chartId) => {
			try {
				const chart = ChartJS.getChart(chartId);
				if (!chart) return "";
				return chart.toBase64Image("image/png", 1);
			} catch (error) {
				console.error(`Chart ${chartId} export failed:`, error);
				return "";
			}
		};

		// Get all chart images by ID
		const activityChartImage = getChartImage("activity-chart");
		const accuracyChartImage = getChartImage("accuracy-chart");
		const studyTimeChartImage = getChartImage("study-time-chart");

		// Load logo image
		const loadLogoImage = () => {
			return new Promise((resolve) => {
				const img = new Image();
				img.crossOrigin = "Anonymous";
				img.onload = () => {
					const canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					const ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0);
					resolve(canvas.toDataURL("image/png"));
				};
				img.onerror = () => resolve(null);
				img.src = "/images/logo/memodeck.png";
			});
		};

		const logoImage = await loadLogoImage();

		// Create PDF
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();

		// Set dark background for all pages
		const setPageBackground = () => {
			doc.setFillColor(26, 26, 46); // #1a1a2e
			doc.rect(0, 0, pageWidth, pageHeight, "F");
		};
		setPageBackground();

		let yPos = 20;

		// Add logo if available
		if (logoImage) {
			const logoSize = 20;
			doc.addImage(
				logoImage,
				"PNG",
				pageWidth / 2 - logoSize / 2,
				yPos,
				logoSize,
				logoSize,
			);
			yPos += logoSize + 10;
		}

		// Title
		doc.setFontSize(22);
		doc.setTextColor(102, 126, 234);
		doc.text(
			t("statistics_report") || "Statistics Report",
			pageWidth / 2,
			yPos,
			{ align: "center" },
		);
		yPos += 8;

		// Subtitle
		doc.setFontSize(10);
		doc.setTextColor(148, 163, 184);
		doc.text(
			t("stats_subtitle") || "Track your learning progress",
			pageWidth / 2,
			yPos,
			{ align: "center" },
		);
		yPos += 10;

		// Meta info
		doc.setFontSize(9);
		doc.text(
			`${dateRangeText}  •  ${selectedDeckName}  •  ${reportDate}`,
			pageWidth / 2,
			yPos,
			{ align: "center" },
		);
		yPos += 15;

		// Stats cards (PDF layout: 2 columns x 3 rows)
		doc.setFillColor(30, 41, 59);
		const cardWidth = 58;
		const cardHeight = 25;
		const cardGap = 5;
		const cols = 2;
		const startX = (pageWidth - (cardWidth * cols + cardGap * (cols - 1))) / 2;

		const stats = [
			{
				label: t("cards_studied") || "Cards Studied",
				value: String(filteredStats.cardsStudied || 0),
				color: [59, 130, 246],
			},
			{
				label: t("correct_answers") || "Correct",
				value: String(filteredStats.correct || 0),
				color: [34, 197, 94],
			},
			{
				label: t("wrong_answers") || "Incorrect",
				value: String(filteredStats.incorrect || 0),
				color: [239, 68, 68],
			},
			{
				label: t("accuracy") || "Accuracy",
				value: `${accuracyPercent}%`,
				color: [139, 92, 246],
			},
			{
				label: t("study_time") || "Study Time",
				value: studyTimeFormatted,
				color: [6, 182, 212],
			},
			{
				label: t("sessions") || "Sessions",
				value: String(filteredStats.sessions || 0),
				color: [245, 158, 11],
			},
		];

		stats.forEach((stat, index) => {
			const row = Math.floor(index / cols);
			const col = index % cols;
			const x = startX + col * (cardWidth + cardGap);
			const y = yPos + row * (cardHeight + cardGap);

			doc.setFillColor(30, 41, 59);
			doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "F");

			doc.setFontSize(18);
			doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
			doc.text(stat.value, x + cardWidth / 2, y + 12, { align: "center" });

			doc.setFontSize(7);
			doc.setTextColor(148, 163, 184);
			doc.text(stat.label.toUpperCase(), x + cardWidth / 2, y + 20, {
				align: "center",
			});
		});

		const rows = Math.ceil(stats.length / cols);
		yPos += rows * (cardHeight + cardGap) + 10;

		// Charts - Alt alta, tam genişlikte (3 grafik)
		const chartWidth = pageWidth - 30;
		const chartHeight = 65; // increased height for better visibility

		// All 3 charts with page break handling
		const charts = [
			{
				image: activityChartImage,
				title: t("study_activity") || "Study Activity",
			},
			{
				image: accuracyChartImage,
				title: t("accuracy_trend") || "Accuracy Trend",
			},
			{ image: studyTimeChartImage, title: t("study_time") || "Study Time" },
		];

		charts.forEach((chart) => {
			if (chart.image) {
				// Page break check
				if (yPos + chartHeight + 20 > pageHeight - 20) {
					doc.addPage();
					setPageBackground();
					yPos = 20;
				}
				doc.setFontSize(10);
				doc.setTextColor(102, 126, 234);
				doc.text(chart.title, 15, yPos);
				yPos += 5;
				doc.addImage(chart.image, "PNG", 15, yPos, chartWidth, chartHeight);
				yPos += chartHeight + 8;
			}
		});

		// Card Performance table
		if (cardsTable.length > 0) {
			// Check if we need a new page
			if (yPos > 240) {
				doc.addPage();
				setPageBackground();
				yPos = 20;
			}

			doc.setFontSize(11);
			doc.setTextColor(226, 232, 240);
			doc.text(t("card_performance") || "Card Performance", 15, yPos);
			yPos += 2; // reduced spacing so title fits better

			const tableData = cardsTable.map((card) => [
				(card.front || "").substring(0, 35) +
					(card.front?.length > 35 ? "..." : ""),
				String(card.times_played || 0),
				String(card.correct || 0),
				String(card.wrong || 0),
				`${card.accuracy || 0}%`,
			]);

			// Tablo için kart container çiz
			const tableStartY = yPos;

			autoTable(doc, {
				startY: yPos + 3,
				head: [
					[
						{
							content: t("flashcards") || "Flashcards",
							styles: { halign: "left" },
						},
						t("times_played") || "Played",
						t("correct") || "Correct",
						t("incorrect") || "Wrong",
						t("accuracy") || "Accuracy",
					],
				],
				body: tableData,
				theme: "plain",
				styles: {
					fillColor: [30, 41, 59],
					textColor: [226, 232, 240],
					fontSize: 8,
					font: "helvetica",
					// Further reduced padding for tighter rows
					cellPadding: { top: 3, right: 5, bottom: 3, left: 5 },
					lineColor: [51, 65, 85],
					lineWidth: 0.1,
					valign: "middle",
					overflow: "ellipsize",
				},
				headStyles: {
					fillColor: [79, 70, 229], // Indigo gradient başlangıcı
					textColor: [255, 255, 255],
					fontSize: 9,
					fontStyle: "bold",
					halign: "center",
					cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
				},
				alternateRowStyles: {
					fillColor: [22, 33, 62],
				},
				columnStyles: {
					0: { cellWidth: 80, halign: "left", fontStyle: "normal" },
					1: { cellWidth: 28, halign: "center" },
					2: { cellWidth: 28, halign: "center" },
					3: { cellWidth: 28, halign: "center" },
					4: { cellWidth: 28, halign: "center", fontStyle: "bold" },
				},
				didParseCell: (data) => {
					// Correct sütunu yeşil
					if (data.section === "body" && data.column.index === 2) {
						data.cell.styles.textColor = [74, 222, 128]; // green-400
					}
					// Wrong sütunu kırmızı
					if (data.section === "body" && data.column.index === 3) {
						data.cell.styles.textColor = [248, 113, 113]; // red-400
					}
					// Accuracy sütununa değere göre renk
					if (data.section === "body" && data.column.index === 4) {
						const value = parseFloat(data.cell.raw) || 0;
						if (value >= 80) {
							data.cell.styles.textColor = [74, 222, 128]; // green-400
						} else if (value >= 50) {
							data.cell.styles.textColor = [251, 191, 36]; // amber-400
						} else {
							data.cell.styles.textColor = [248, 113, 113]; // red-400
						}
					}
				},
				didDrawCell: (data) => {
					// Sıra numarası için sol kenara ince çizgi
					if (data.section === "body" && data.column.index === 0) {
						const accuracy = parseFloat(tableData[data.row.index]?.[4]) || 0;
						let color;
						if (accuracy >= 80) {
							color = [74, 222, 128];
						} else if (accuracy >= 50) {
							color = [251, 191, 36];
						} else {
							color = [248, 113, 113];
						}
						doc.setFillColor(color[0], color[1], color[2]);
						// smaller vertical inset to match reduced padding
						doc.rect(
							data.cell.x,
							data.cell.y + 2,
							2,
							Math.max(6, data.cell.height - 4),
							"F",
						);
					}
				},
				willDrawPage: (data) => {
					// Her yeni sayfada içerik çizilmeden ÖNCE arka planı çiz
					if (data.pageNumber > 1) {
						doc.setFillColor(26, 26, 46);
						doc.rect(0, 0, pageWidth, pageHeight, "F");
					}
				},
				margin: { left: 15, right: 15 },
				tableWidth: "auto",
				showHead: "everyPage",
			});
			// move yPos after table so following content doesn't overlap
			if (doc.lastAutoTable) {
				yPos = doc.lastAutoTable.finalY + 6;
			}
		}

		// Footer
		const pageCount = doc.internal.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFontSize(8);
			doc.setTextColor(100, 116, 139);
			doc.text(
				`Generated by MemoDeck App • ${reportDate}`,
				pageWidth / 2,
				doc.internal.pageSize.getHeight() - 10,
				{ align: "center" },
			);
		}

		// Save PDF
		doc.save(`stats-report-${dayjs().format("YYYY-MM-DD")}.pdf`);
	}, [filteredStats, cardsTable, dateRange, selectedDeck, decksData, t]);

	// Line chart options
	const lineChartOptions = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					backgroundColor: theme.palette.background.paper,
					titleColor: theme.palette.text.cardTitle,
					bodyColor: theme.palette.text.cardSubtitle,
					borderColor: theme.palette.divider,
					borderWidth: 1,
					padding: 12,
					cornerRadius: 8,
					displayColors: false,
				},
			},
			scales: {
				x: {
					grid: { color: chartColors.grid },
					ticks: { color: chartColors.text, font: { family: "Inter" } },
				},
				y: {
					grid: { color: chartColors.grid },
					ticks: { color: chartColors.text, font: { family: "Inter" } },
					beginAtZero: true,
				},
			},
			elements: {
				line: { tension: 0.4 },
				point: { radius: 3, hoverRadius: 5 },
			},
		}),
		[theme, chartColors],
	);

	// Activity line chart data
	const activityChartData = useMemo(
		() => ({
			labels: (chartData.data || []).map((d) =>
				formatDateLabel(d.date, chartData.grouping),
			),
			datasets: [
				{
					label: t("cards_studied") || "Cards Studied",
					data: (chartData.data || []).map(
						(d) => parseInt(d.cardsStudied) || 0,
					),
					borderColor: chartColors.primary,
					backgroundColor: `${chartColors.primary}20`,
					fill: true,
					pointBackgroundColor: chartColors.primary,
				},
			],
		}),
		[chartData, chartColors, t, formatDateLabel],
	);

	// Accuracy trend chart data
	const accuracyChartData = useMemo(
		() => ({
			labels: (chartData.data || []).map((d) =>
				formatDateLabel(d.date, chartData.grouping),
			),
			datasets: [
				{
					label: t("correct") || "Correct",
					data: (chartData.data || []).map((d) => parseInt(d.correct) || 0),
					borderColor: chartColors.success,
					backgroundColor: `${chartColors.success}20`,
					fill: false,
					pointBackgroundColor: chartColors.success,
				},
				{
					label: t("incorrect") || "Incorrect",
					data: (chartData.data || []).map((d) => parseInt(d.incorrect) || 0),
					borderColor: chartColors.error,
					backgroundColor: `${chartColors.error}20`,
					fill: false,
					pointBackgroundColor: chartColors.error,
				},
			],
		}),
		[chartData, chartColors, t, formatDateLabel],
	);

	// Study time bar chart data
	const studyTimeChartData = useMemo(
		() => ({
			labels: (chartData.data || []).map((d) =>
				formatDateLabel(d.date, chartData.grouping),
			),
			datasets: [
				{
					label: t("study_time") || "Study Time (min)",
					data: (chartData.data || []).map((d) =>
						Math.round((parseInt(d.studyTimeSeconds) || 0) / 60),
					),
					backgroundColor: chartColors.secondary,
					borderRadius: 8,
				},
			],
		}),
		[chartData, chartColors, t, formatDateLabel],
	);

	// Bar chart options
	const barChartOptions = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
			scales: {
				x: {
					grid: { display: false },
					ticks: { color: chartColors.text, font: { family: "Inter" } },
				},
				y: {
					grid: { color: chartColors.grid },
					ticks: {
						color: chartColors.text,
						font: { family: "Inter" },
						callback: (v) => `${v}m`,
					},
					beginAtZero: true,
				},
			},
		}),
		[chartColors],
	);

	// Calculate accuracy percentage
	const accuracy = useMemo(() => {
		if (!filteredStats) return 0;
		const total = (filteredStats.correct || 0) + (filteredStats.incorrect || 0);
		if (total === 0) return 0;
		return Math.round((filteredStats.correct / total) * 100);
	}, [filteredStats]);

	if (loading && !filteredStats) {
		return (
			<PageContainer>
				<StatsSkeleton />
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			{/* Header */}
			<MotionBox initial={{ y: -10 }} animate={{ y: 0 }} sx={{ mb: 3 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						flexWrap: "wrap",
						gap: 2,
					}}
				>
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
							<TrendingUpIcon sx={{ color: "primary.light", fontSize: 32 }} />
							{t("statistics") || "Statistics"}
						</Typography>
						<Typography
							variant="body2"
							sx={{
								color: "text.cardSubtitle",
								mt: 0.5,
								fontFamily: "Inter, sans-serif",
							}}
						>
							{t("stats_subtitle") || "Track your learning progress"}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", gap: 1 }}>
						<Tooltip title={t("download_report") || "Download Report"}>
							<IconButton
								onClick={handleDownloadReport}
								sx={{ color: "text.cardSubtitle" }}
								disabled={!filteredStats}
							>
								<DownloadIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title={t("refresh") || "Refresh"}>
							<IconButton
								onClick={handleRefresh}
								sx={{ color: "text.cardSubtitle" }}
							>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Box>
				</Box>
			</MotionBox>

			{/* Filters Section */}
			<MotionBox
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.1 }}
				sx={{ mb: 3 }}
			>
				<StyledCard variant="default" padding={3}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							mb: 2,
						}}
					>
						<FilterListIcon sx={{ color: "text.cardSubtitle", fontSize: 20 }} />
						<Typography
							variant="subtitle2"
							sx={{
								color: "text.cardTitle",
								fontFamily: "Inter",
								fontWeight: 600,
							}}
						>
							{t("filters") || "Filters"}
						</Typography>
					</Box>

					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							gap: 3,
							alignItems: { xs: "stretch", md: "flex-end" },
						}}
					>
						{/* Deck Filter */}
						<FormControl size="small" sx={{ minWidth: 200 }}>
							<InputLabel>{t("deck") || "Deck"}</InputLabel>
							<Select
								value={selectedDeck}
								label={t("deck") || "Deck"}
								onChange={(e) => setSelectedDeck(e.target.value)}
								sx={{
									"& .MuiSelect-select": {
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									},
								}}
							>
								<MenuItem value="all">{t("all_decks") || "All Decks"}</MenuItem>
								{decksData.map((deck) => (
									<MenuItem
										key={deck.id}
										value={deck.id}
										sx={{
											maxWidth: 300,
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{deck.title}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Date Range Pickers */}
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
								<DatePicker
									label={t("start_date") || "Start Date"}
									value={dateRange[0]}
									onChange={(newValue) =>
										handleDatePickerChange("start", newValue)
									}
									maxDate={dateRange[1] || dayjs()}
									slotProps={{
										textField: {
											size: "small",
											sx: { width: 160 },
										},
									}}
								/>
								<Typography sx={{ color: "text.cardSubtitle" }}>—</Typography>
								<DatePicker
									label={t("end_date") || "End Date"}
									value={dateRange[1]}
									onChange={(newValue) =>
										handleDatePickerChange("end", newValue)
									}
									minDate={dateRange[0]}
									maxDate={dayjs()}
									slotProps={{
										textField: {
											size: "small",
											sx: { width: 160 },
										},
									}}
								/>
							</Box>
						</LocalizationProvider>

						{/* Quick Presets */}
						<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
							{DATE_PRESETS.map((preset) => (
								<PresetButton
									key={preset.key}
									label={
										preset.key === "today"
											? t("today") || "Today"
											: preset.key === "all"
												? t("all_time_short") || "All"
												: t(`${preset.key.replace("d", "_days")}`) ||
													preset.key.toUpperCase()
									}
									active={activePreset === preset.key}
									onClick={() => handlePresetClick(preset.key)}
								/>
							))}
						</Box>
					</Box>
				</StyledCard>
			</MotionBox>

			{/* Stats Cards: 2 columns x 3 rows */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
					gap: 2,
					mb: 3,
				}}
			>
				<StatCard
					icon={SchoolIcon}
					title={t("cards_studied") || "Cards Studied"}
					value={filteredStats?.cardsStudied || 0}
					color={chartColors.primary}
					delay={0.1}
				/>
				<StatCard
					icon={CheckCircleIcon}
					title={t("correct_answers") || "Correct"}
					value={filteredStats?.correct || 0}
					color={chartColors.success}
					delay={0.15}
				/>
				<StatCard
					icon={ErrorIcon}
					title={t("wrong_answers") || "Incorrect"}
					value={filteredStats?.incorrect || 0}
					color={chartColors.error}
					delay={0.2}
				/>
				<StatCard
					icon={EmojiEventsIcon}
					title={t("accuracy") || "Accuracy"}
					value={`${accuracy}%`}
					color={chartColors.secondary}
					delay={0.25}
				/>
				<StatCard
					icon={AccessTimeIcon}
					title={t("study_time") || "Study Time"}
					value={formatDuration(filteredStats?.studyTimeSeconds || 0)}
					color={chartColors.info}
					delay={0.3}
				/>
				<StatCard
					icon={CalendarTodayIcon}
					title={t("sessions") || "Sessions"}
					value={filteredStats?.sessions || 0}
					color={chartColors.warning}
					delay={0.35}
				/>
			</Box>

			{/* Charts Row 1 */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr",
					gap: 3,
					mb: 3,
				}}
			>
				<MotionBox
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					<StyledCard variant="default" padding={3}>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 600,
								color: "text.cardTitle",
								fontFamily: "Inter",
								mb: 3,
							}}
						>
							{t("study_activity") || "Study Activity"}
							{chartData.grouping === "monthly" && (
								<Chip
									size="small"
									label={t("monthly") || "Monthly"}
									sx={{ ml: 1, fontSize: 11 }}
								/>
							)}
						</Typography>
						<Box sx={{ height: 300 }}>
							{chartData.data?.length > 0 ? (
								<Line
									id="activity-chart"
									data={activityChartData}
									options={lineChartOptions}
								/>
							) : (
								<Box
									sx={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Typography sx={{ color: "text.cardSubtitle" }}>
										{t("no_data") || "No data for selected period"}
									</Typography>
								</Box>
							)}
						</Box>
					</StyledCard>
				</MotionBox>
			</Box>

			{/* Charts Row 2 & 3: Each chart in its own row */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr",
					gap: 3,
					mb: 3,
				}}
			>
				<MotionBox
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<StyledCard variant="default" padding={3}>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 600,
								color: "text.cardTitle",
								fontFamily: "Inter",
								mb: 3,
							}}
						>
							{t("accuracy_trend") || "Accuracy Trend"}
						</Typography>
						<Box sx={{ height: 280 }}>
							{chartData.data?.length > 0 ? (
								<Line
									id="accuracy-chart"
									data={accuracyChartData}
									options={{
										...lineChartOptions,
										plugins: {
											...lineChartOptions.plugins,
											legend: {
												display: true,
												position: "top",
												labels: { color: chartColors.text },
											},
										},
									}}
								/>
							) : (
								<Box
									sx={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Typography sx={{ color: "text.cardSubtitle" }}>
										{t("no_data") || "No data for selected period"}
									</Typography>
								</Box>
							)}
						</Box>
					</StyledCard>
				</MotionBox>

				<MotionBox
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.55 }}
				>
					<StyledCard variant="default" padding={3}>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 600,
								color: "text.cardTitle",
								fontFamily: "Inter",
								mb: 3,
							}}
						>
							{t("study_time_chart") || "Study Time"}
						</Typography>
						<Box sx={{ height: 280 }}>
							{chartData.data?.length > 0 ? (
								<Bar
									id="study-time-chart"
									data={studyTimeChartData}
									options={barChartOptions}
								/>
							) : (
								<Box
									sx={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Typography sx={{ color: "text.cardSubtitle" }}>
										{t("no_data") || "No data for selected period"}
									</Typography>
								</Box>
							)}
						</Box>
					</StyledCard>
				</MotionBox>
			</Box>

			{/* Cards Performance Table */}
			<MotionBox
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.6 }}
			>
				<StyledCard variant="default" padding={3}>
					<Typography
						variant="h6"
						sx={{
							fontWeight: 600,
							color: "text.cardTitle",
							fontFamily: "Inter",
							mb: 2,
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
					>
						<StyleIcon sx={{ color: chartColors.primary }} />
						{t("card_performance") || "Card Performance"}
					</Typography>

					{cardsTable.length > 0 ? (
						<TableContainer sx={{ maxHeight: 400 }}>
							<Table stickyHeader size="small">
								<TableHead>
									<TableRow>
										<TableCell
											sx={{ color: "text.cardSubtitle", minWidth: 200 }}
										>
											{t("card_title") || "Card"}
										</TableCell>
										{selectedDeck === "all" && (
											<TableCell sx={{ color: "text.cardSubtitle" }}>
												{t("deck") || "Deck"}
											</TableCell>
										)}
										<TableCell
											align="center"
											sx={{ color: "text.cardSubtitle" }}
										>
											<TableSortLabel
												active={sortBy === "times_played"}
												direction={
													sortBy === "times_played" ? sortOrder : "desc"
												}
												onClick={() => handleSort("times_played")}
											>
												{t("times_played") || "Played"}
											</TableSortLabel>
										</TableCell>
										<TableCell
											align="center"
											sx={{ color: "text.cardSubtitle" }}
										>
											<TableSortLabel
												active={sortBy === "correct"}
												direction={sortBy === "correct" ? sortOrder : "desc"}
												onClick={() => handleSort("correct")}
											>
												{t("correct") || "Correct"}
											</TableSortLabel>
										</TableCell>
										<TableCell
											align="center"
											sx={{ color: "text.cardSubtitle" }}
										>
											<TableSortLabel
												active={sortBy === "wrong"}
												direction={sortBy === "wrong" ? sortOrder : "desc"}
												onClick={() => handleSort("wrong")}
											>
												{t("incorrect") || "Incorrect"}
											</TableSortLabel>
										</TableCell>
										<TableCell
											align="center"
											sx={{ color: "text.cardSubtitle" }}
										>
											<TableSortLabel
												active={sortBy === "accuracy"}
												direction={sortBy === "accuracy" ? sortOrder : "desc"}
												onClick={() => handleSort("accuracy")}
											>
												{t("accuracy") || "Accuracy"}
											</TableSortLabel>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{cardsTable.map((card) => (
										<TableRow key={card.id} hover>
											<TableCell
												sx={{
													color: "text.cardTitle",
													maxWidth: 250,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{card.front?.length > 50 ? (
													<Tooltip title={card.front} arrow>
														<span>{card.front}</span>
													</Tooltip>
												) : (
													card.front
												)}
											</TableCell>
											{selectedDeck === "all" && (
												<TableCell
													sx={{
														color: "text.cardSubtitle",
														maxWidth: 150,
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													}}
												>
													{card.deck_title}
												</TableCell>
											)}
											<TableCell
												align="center"
												sx={{ color: "text.cardTitle" }}
											>
												{card.times_played || 0}
											</TableCell>
											<TableCell align="center">
												<Chip
													size="small"
													label={card.correct || 0}
													sx={{
														bgcolor: "success.main",
														color: "white",
														minWidth: 40,
													}}
												/>
											</TableCell>
											<TableCell align="center">
												<Chip
													size="small"
													label={card.wrong || 0}
													sx={{
														bgcolor: "error.main",
														color: "white",
														minWidth: 40,
													}}
												/>
											</TableCell>
											<TableCell align="center">
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														gap: 1,
													}}
												>
													<LinearProgress
														variant="determinate"
														value={parseFloat(card.accuracy) || 0}
														sx={{
															width: 50,
															height: 6,
															borderRadius: 3,
															bgcolor: "action.hover",
															"& .MuiLinearProgress-bar": {
																bgcolor:
																	card.accuracy >= 80
																		? "success.main"
																		: card.accuracy >= 50
																			? "warning.main"
																			: "error.main",
															},
														}}
													/>
													<Typography
														variant="body2"
														sx={{
															color: "text.cardTitle",
															minWidth: 35,
															fontSize: 12,
														}}
													>
														{card.accuracy || 0}%
													</Typography>
												</Box>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<Box
							sx={{
								py: 6,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Typography sx={{ color: "text.cardSubtitle" }}>
								{t("no_cards_data") || "No card performance data yet"}
							</Typography>
						</Box>
					)}
				</StyledCard>
			</MotionBox>
		</PageContainer>
	);
}
