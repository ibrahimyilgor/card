import {
	useEffect,
	useState,
	useContext,
	useMemo,
	useCallback,
	useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
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
	Snackbar,
	Alert,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/tr";
dayjs.extend(utc);
import $ from "jquery";
import moment from "moment";
import "daterangepicker/daterangepicker.css";
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

// ---------------------------------------------------------------------------
// Mock data shown to free-plan users so they can preview the stats page
// ---------------------------------------------------------------------------
const _mockCounts = [
	8, 15, 0, 22, 18, 30, 12, 25, 0, 20, 35, 10, 28, 15, 22, 8, 18, 32, 14, 25, 0,
	20, 28, 16, 22, 10, 30, 18, 25, 14,
];
const MOCK_FILTERED_STATS = {
	cardsStudied: 247,
	correct: 189,
	incorrect: 58,
	studyTimeSeconds: 7320,
	sessions: 18,
};
const MOCK_CHART_DATA = {
	grouping: "daily",
	data: _mockCounts.map((n, i) => {
		const d = new Date(2026, 0, 20 + i);
		const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		return {
			date,
			cardsStudied: n,
			correct: Math.floor(n * 0.8),
			incorrect: Math.ceil(n * 0.2),
			studyTimeSeconds: n * 40,
		};
	}),
};
const MOCK_CARDS_TABLE = [
	{
		id: 1,
		front: "apple",
		deck_title: "English",
		times_played: 28,
		correct: 24,
		wrong: 4,
		accuracy: 86,
	},
	{
		id: 2,
		front: "book",
		deck_title: "English",
		times_played: 22,
		correct: 18,
		wrong: 4,
		accuracy: 82,
	},
	{
		id: 3,
		front: "water",
		deck_title: "English",
		times_played: 19,
		correct: 14,
		wrong: 5,
		accuracy: 74,
	},
	{
		id: 4,
		front: "house",
		deck_title: "English",
		times_played: 17,
		correct: 10,
		wrong: 7,
		accuracy: 59,
	},
	{
		id: 5,
		front: "cat",
		deck_title: "English",
		times_played: 15,
		correct: 8,
		wrong: 7,
		accuracy: 53,
	},
	{
		id: 6,
		front: "dog",
		deck_title: "English",
		times_played: 12,
		correct: 5,
		wrong: 7,
		accuracy: 42,
	},
];
// ---------------------------------------------------------------------------

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
	// { key: "today", days: 0 },
	{ key: "7d", days: 7 },
	{ key: "30d", days: 30 },
	{ key: "90d", days: 90 },
	{ key: "180d", days: 180 },
	{ key: "1y", days: 365 },
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
	const { t, lang } = useContext(I18nContext);
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

	// Date range warning
	const [dateWarning, setDateWarning] = useState("");

	// Whether user is on a free plan (no advanced stats access)
	const isLocked = !planLoading && !advancedStats;

	// Use mock data for locked users so they can preview what they'd get
	const effectiveStats = isLocked ? MOCK_FILTERED_STATS : filteredStats;
	const effectiveChartData = isLocked ? MOCK_CHART_DATA : chartData;
	const effectiveCardsTable = isLocked ? MOCK_CARDS_TABLE : cardsTable;

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

	// Ensure dayjs uses the app language for month/day names
	useEffect(() => {
		// Prefer explicit lang from context; fallback to localStorage or English.
		const initial = lang || localStorage.getItem("lang") || "en";
		try {
			dayjs.locale(initial);
		} catch (e) {
			dayjs.locale("en");
		}
	}, [lang]);

	// Format date for display using dayjs + current locale
	// Normalize incoming ISO timestamps (UTC) to local time so labels
	// reflect the user's local day (avoids off-by-one due to UTC offsets).
	const formatDateLabel = useCallback(
		(dateStr, grouping) => {
			if (!dateStr) return "-";

			// Monthly keys sometimes come as "YYYY-MM" or full ISO — normalize
			if (grouping === "monthly") {
				const monthKey = /^\d{4}-\d{2}$/.test(dateStr)
					? dateStr + "-01"
					: dateStr;
				return (/T|Z/.test(monthKey)
					? dayjs.utc(monthKey).local()
					: dayjs(monthKey)
				).format("MMM YYYY");
			}

			// Plain YYYY-MM-DD: parse as local; ISO timestamp: convert UTC→local
			if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
				return dayjs(dateStr).format("MMM D");
			}
			return dayjs.utc(dateStr).local().format("MMM D");
		},
		[lang],
	);

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

	// Daterangepicker ref
	const dateRangeRef = useRef(null);

	// Initialize daterangepicker
	useEffect(() => {
		if (!dateRangeRef.current) return;

		// Ensure jQuery is available globally before loading the plugin
		if (typeof window !== "undefined") {
			window.jQuery = window.$ = $;
		}

		let mounted = true;
		(async () => {
			try {
				await import("daterangepicker");

				if (!mounted) return;
				const $el = $(dateRangeRef.current);
				const startDate = dateRange[0]
					? moment(dateRange[0].toDate())
					: moment().subtract(29, "days");
				const endDate = dateRange[1] ? moment(dateRange[1].toDate()) : moment();

				$el.daterangepicker(
					{
						startDate,
						endDate,
						maxDate: moment(),
						maxSpan: { days: 365 },
						opens: "center",
						locale: {
							format: "DD/MM/YYYY",
							applyLabel: t("apply") || "Apply",
							cancelLabel: t("cancel") || "Cancel",
							customRangeLabel: t("custom_range") || "Custom Range",
						},
						ranges: {
							[t("7_days") || "Last 7 Days"]: [
								moment().subtract(6, "days"),
								moment(),
							],
							[t("30_days") || "Last 30 Days"]: [
								moment().subtract(29, "days"),
								moment(),
							],
							[t("90_days") || "Last 90 Days"]: [
								moment().subtract(89, "days"),
								moment(),
							],
						},
					},
					(start, end) => {
						const diffDays = end.diff(start, "days");
						if (diffDays > 365) {
							setDateWarning(
								t("date_range_max_warning") ||
									"Date range cannot exceed 1 year. Please select a shorter range.",
							);
							return;
						}
						setActivePreset(null);
						setDateRange([dayjs(start.toDate()), dayjs(end.toDate())]);
					},
				);
			} catch (err) {
				console.error("Failed to load daterangepicker plugin:", err);
			}
		})();

		return () => {
			mounted = false;
			if (dateRangeRef.current) {
				const picker = $(dateRangeRef.current).data("daterangepicker");
				if (picker) picker.remove();
			}
		};
	}, [t]);

	// Sync daterangepicker when presets change the dateRange
	useEffect(() => {
		if (!dateRangeRef.current) return;
		const picker = $(dateRangeRef.current).data("daterangepicker");
		if (picker && dateRange[0] && dateRange[1]) {
			picker.setStartDate(moment(dateRange[0].toDate()));
			picker.setEndDate(moment(dateRange[1].toDate()));
		}
	}, [dateRange]);

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
		if (!effectiveStats) return;

		const total =
			(effectiveStats.correct || 0) + (effectiveStats.incorrect || 0);
		const accuracyPercent =
			total > 0 ? Math.round((effectiveStats.correct / total) * 100) : 0;
		const hours = Math.floor((effectiveStats.studyTimeSeconds || 0) / 3600);
		const minutes = Math.floor(
			((effectiveStats.studyTimeSeconds || 0) % 3600) / 60,
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

		// Türkçe dahil tüm Unicode karakterleri destekleyen Roboto fontunu yükle ve göm
		let fontEmbedded = false;
		try {
			const res = await fetch("/fonts/Roboto-Regular.ttf");
			if (!res.ok) throw new Error("Font fetch failed: " + res.status);
			const buf = await res.arrayBuffer();
			const bytes = new Uint8Array(buf);
			let binary = "";
			for (let i = 0; i < bytes.length; i += 0x8000) {
				binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
			}
			const b64 = btoa(binary);
			doc.addFileToVFS("Roboto-Regular.ttf", b64);
			doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
			fontEmbedded = true;
		} catch (err) {
			console.warn("Font yüklenemedi, varsayılan font kullanılacak:", err);
		}

		// Her doc.text() öncesinde çağrılacak kısayol
		const setDocFont = (size) => {
			if (fontEmbedded) doc.setFont("Roboto", "normal");
			if (size) doc.setFontSize(size);
		};

		// Türkçe büyük harf dönüşümü
		const toUpperTR = (str) =>
			str
				.replace(
					/[iışğüöç]/g,
					(c) =>
						({
							i: "İ",
							ı: "I",
							ş: "Ş",
							ğ: "Ğ",
							ü: "Ü",
							ö: "Ö",
							ç: "Ç",
						})[c] ?? c,
				)
				.toLocaleUpperCase("tr-TR");
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
		setDocFont(22);
		doc.setTextColor(102, 126, 234);
		doc.text(
			t("statistics_report") || "Statistics Report",
			pageWidth / 2,
			yPos,
			{ align: "center" },
		);
		yPos += 8;

		// Subtitle
		setDocFont(10);
		doc.setTextColor(148, 163, 184);
		doc.text(
			t("stats_subtitle") || "Track your learning progress",
			pageWidth / 2,
			yPos,
			{ align: "center" },
		);
		yPos += 10;

		// Meta info
		setDocFont(9);
		doc.setTextColor(148, 163, 184);
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
				value: String(effectiveStats.cardsStudied || 0),
				color: [59, 130, 246],
			},
			{
				label: t("correct_answers") || "Correct",
				value: String(effectiveStats.correct || 0),
				color: [34, 197, 94],
			},
			{
				label: t("wrong_answers") || "Incorrect",
				value: String(effectiveStats.incorrect || 0),
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
				value: String(effectiveStats.sessions || 0),
				color: [245, 158, 11],
			},
		];

		const activeFont = fontEmbedded ? "Roboto" : "helvetica";

		stats.forEach((stat, index) => {
			const row = Math.floor(index / cols);
			const col = index % cols;
			const x = startX + col * (cardWidth + cardGap);
			const y = yPos + row * (cardHeight + cardGap);

			doc.setFillColor(30, 41, 59);
			doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "F");

			setDocFont(18);
			doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
			doc.text(stat.value, x + cardWidth / 2, y + 12, { align: "center" });

			setDocFont(7);
			doc.setTextColor(148, 163, 184);
			doc.text(toUpperTR(stat.label), x + cardWidth / 2, y + 20, {
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
				setDocFont(10);
				doc.setTextColor(102, 126, 234);
				doc.text(chart.title, 15, yPos);
				yPos += 5;
				doc.addImage(chart.image, "PNG", 15, yPos, chartWidth, chartHeight);
				yPos += chartHeight + 8;
			}
		});

		// Card Performance table
		if (effectiveCardsTable.length > 0) {
			// Check if we need a new page
			if (yPos > 240) {
				doc.addPage();
				setPageBackground();
				yPos = 20;
			}

			setDocFont(11);
			doc.setTextColor(226, 232, 240);
			doc.text(t("card_performance") || "Card Performance", 15, yPos);
			yPos += 2;

			const tableData = effectiveCardsTable.map((card) => [
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
					font: fontEmbedded ? "Roboto" : "helvetica",
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
					font: fontEmbedded ? "Roboto" : "helvetica",
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
			setDocFont(8);
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
	}, [
		effectiveStats,
		effectiveCardsTable,
		dateRange,
		selectedDeck,
		decksData,
		t,
	]);

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

	// Fill missing dates/months so x-axis shows every value in range
	const filledChartData = useMemo(() => {
		// Use mock chart data for locked users (skip date-range filling)
		if (isLocked) return effectiveChartData;
		const rawData = effectiveChartData.data || [];
		if (!dateRange[0] || !dateRange[1] || rawData.length === 0) {
			return {
				data: rawData,
				grouping: effectiveChartData.grouping || "daily",
			};
		}

		const start = dateRange[0];
		const end = dateRange[1];
		const diffDays = end.diff(start, "day");
		const isDaily = diffDays <= 31;

		const emptyEntry = (date) => ({
			date,
			cardsStudied: 0,
			correct: 0,
			incorrect: 0,
			studyTimeSeconds: 0,
		});

		if (isDaily) {
			const dataMap = new Map();
			rawData.forEach((d) => {
				// Convert ISO UTC timestamp to the user's local date string
				const key = d.date
					? dayjs.utc(d.date).local().format("YYYY-MM-DD")
					: undefined;
				if (dataMap.has(key)) {
					const ex = dataMap.get(key);
					dataMap.set(key, {
						date: key,
						cardsStudied:
							(parseInt(ex.cardsStudied) || 0) +
							(parseInt(d.cardsStudied) || 0),
						correct: (parseInt(ex.correct) || 0) + (parseInt(d.correct) || 0),
						incorrect:
							(parseInt(ex.incorrect) || 0) + (parseInt(d.incorrect) || 0),
						studyTimeSeconds:
							(parseInt(ex.studyTimeSeconds) || 0) +
							(parseInt(d.studyTimeSeconds) || 0),
					});
				} else {
					dataMap.set(key, { ...d, date: key });
				}
			});

			const filled = [];
			let current = start;
			while (current.isBefore(end, "day") || current.isSame(end, "day")) {
				const dateStr = current.format("YYYY-MM-DD");
				filled.push(dataMap.get(dateStr) || emptyEntry(dateStr));
				current = current.add(1, "day");
			}
			return { data: filled, grouping: "daily" };
		} else {
			const dataMap = new Map();
			rawData.forEach((d) => {
				// Convert ISO UTC timestamp to the user's local month key
				const monthKey = d.date
					? dayjs.utc(d.date).local().format("YYYY-MM")
					: undefined;
				if (dataMap.has(monthKey)) {
					const ex = dataMap.get(monthKey);
					dataMap.set(monthKey, {
						date: monthKey + "-01",
						cardsStudied:
							(parseInt(ex.cardsStudied) || 0) +
							(parseInt(d.cardsStudied) || 0),
						correct: (parseInt(ex.correct) || 0) + (parseInt(d.correct) || 0),
						incorrect:
							(parseInt(ex.incorrect) || 0) + (parseInt(d.incorrect) || 0),
						studyTimeSeconds:
							(parseInt(ex.studyTimeSeconds) || 0) +
							(parseInt(d.studyTimeSeconds) || 0),
					});
				} else {
					dataMap.set(monthKey, {
						...d,
						date: monthKey + "-01",
					});
				}
			});

			const filled = [];
			let current = start.startOf("month");
			const endMonth = end.startOf("month");
			while (
				current.isBefore(endMonth, "month") ||
				current.isSame(endMonth, "month")
			) {
				const monthKey = current.format("YYYY-MM");
				filled.push(
					dataMap.get(monthKey) || emptyEntry(current.format("YYYY-MM-01")),
				);
				current = current.add(1, "month");
			}
			return { data: filled, grouping: "monthly" };
		}
	}, [effectiveChartData, dateRange, isLocked]);

	// Activity line chart data
	const activityChartData = useMemo(
		() => ({
			labels: (filledChartData.data || []).map((d) =>
				formatDateLabel(d.date, filledChartData.grouping),
			),
			datasets: [
				{
					label: t("cards_studied") || "Cards Studied",
					data: (filledChartData.data || []).map(
						(d) => parseInt(d.cardsStudied) || 0,
					),
					borderColor: chartColors.primary,
					backgroundColor: `${chartColors.primary}20`,
					fill: true,
					pointBackgroundColor: chartColors.primary,
				},
			],
		}),
		[filledChartData, chartColors, t, formatDateLabel],
	);

	// Accuracy trend chart data
	const accuracyChartData = useMemo(
		() => ({
			labels: (filledChartData.data || []).map((d) =>
				formatDateLabel(d.date, filledChartData.grouping),
			),
			datasets: [
				{
					label: t("correct") || "Correct",
					data: (filledChartData.data || []).map(
						(d) => parseInt(d.correct) || 0,
					),
					borderColor: chartColors.success,
					backgroundColor: `${chartColors.success}20`,
					fill: false,
					pointBackgroundColor: chartColors.success,
				},
				{
					label: t("incorrect") || "Incorrect",
					data: (filledChartData.data || []).map(
						(d) => parseInt(d.incorrect) || 0,
					),
					borderColor: chartColors.error,
					backgroundColor: `${chartColors.error}20`,
					fill: false,
					pointBackgroundColor: chartColors.error,
				},
			],
		}),
		[filledChartData, chartColors, t, formatDateLabel],
	);

	// Study time bar chart data
	const studyTimeChartData = useMemo(
		() => ({
			labels: (filledChartData.data || []).map((d) =>
				formatDateLabel(d.date, filledChartData.grouping),
			),
			datasets: [
				{
					label: t("study_time") || "Study Time (min)",
					data: (filledChartData.data || []).map((d) =>
						Math.round((parseInt(d.studyTimeSeconds) || 0) / 60),
					),
					backgroundColor: chartColors.secondary,
					borderRadius: 8,
				},
			],
		}),
		[filledChartData, chartColors, t, formatDateLabel],
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
		if (!effectiveStats) return 0;
		const total =
			(effectiveStats.correct || 0) + (effectiveStats.incorrect || 0);
		if (total === 0) return 0;
		return Math.round((effectiveStats.correct / total) * 100);
	}, [effectiveStats]);

	if (!isLocked && loading && !filteredStats) {
		return (
			<PageContainer>
				<StatsSkeleton />
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			{/* ── Locked / preview banner ── */}
			{isLocked && (
				<MotionBox
					initial={{ y: -8, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.3 }}
					sx={{
						mb: 3,
						p: 2.5,
						borderRadius: 3,
						background:
							"linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.08) 100%)",
						border: "1px solid",
						borderColor: "warning.main",
						display: "flex",
						alignItems: { xs: "flex-start", sm: "center" },
						flexDirection: { xs: "column", sm: "row" },
						gap: 2,
					}}
				>
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}
					>
						<LockIcon sx={{ color: "warning.main", flexShrink: 0 }} />
						<Box>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 700,
									color: "warning.main",
									fontFamily: "Inter, sans-serif",
								}}
							>
								{t("stats_locked_title") || "Statistics Locked"}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: "text.cardSubtitle",
									fontFamily: "Inter, sans-serif",
									mt: 0.25,
								}}
							>
								{t("stats_preview_description") ||
									"This is a preview with sample data. Upgrade your plan to see your real statistics."}
							</Typography>
						</Box>
					</Box>
					<Button
						variant="contained"
						color="warning"
						size="small"
						startIcon={<UpgradeIcon />}
						onClick={() => navigate("/plans")}
						sx={{
							fontWeight: 600,
							borderRadius: 2,
							whiteSpace: "nowrap",
							flexShrink: 0,
						}}
					>
						{t("upgrade_plan") || "Upgrade Plan"}
					</Button>
				</MotionBox>
			)}

			{/* ── Main content (blurred & non-interactive for free users) ── */}
			<MotionConfig reducedMotion={isLocked ? "always" : "never"}>
				<Box sx={{ position: "relative" }}>
					{/* blur overlay — sits on top, içerik normal DOM akışında kalır */}
					{isLocked && (
						<Box
							aria-hidden
							sx={{
								position: "absolute",
								inset: 0,
								backdropFilter: "blur(2px)",
								WebkitBackdropFilter: "blur(2px)",
								background: "rgba(15,23,42,0.35)",
								borderRadius: 3,
								zIndex: 10,
								pointerEvents: "none",
							}}
						/>
					)}

					{/* gerçek içerik */}
					<Box
						sx={{
							pointerEvents: isLocked ? "none" : "auto",
							userSelect: isLocked ? "none" : "auto",
						}}
					>
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
										<TrendingUpIcon
											sx={{ color: "primary.light", fontSize: 32 }}
										/>
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
											disabled={!effectiveStats || isLocked}
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
									<FilterListIcon
										sx={{ color: "text.cardSubtitle", fontSize: 20 }}
									/>
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
										alignItems: { xs: "stretch", md: "center" },
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
											<MenuItem value="all">
												{t("all_decks") || "All Decks"}
											</MenuItem>
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

									{/* Date Range Picker */}
									{/* <Box
							component="input"
							ref={dateRangeRef}
							readOnly
							sx={{
								px: 2,
								py: 1,
								borderRadius: "8px",
								border: "1px solid",
								borderColor: "divider",
								bgcolor: "background.paper",
								color: "text.cardTitle",
								fontFamily: "Inter, sans-serif",
								fontSize: 13,
								minWidth: 220,
								cursor: "pointer",
								outline: "none",
								"&:hover": {
									borderColor: "primary.main",
								},
								"&:focus": {
									borderColor: "primary.main",
								},
							}}
						/> */}

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
								value={effectiveStats?.cardsStudied || 0}
								color={chartColors.primary}
								delay={0.1}
							/>
							<StatCard
								icon={CheckCircleIcon}
								title={t("correct_answers") || "Correct"}
								value={effectiveStats?.correct || 0}
								color={chartColors.success}
								delay={0.15}
							/>
							<StatCard
								icon={ErrorIcon}
								title={t("wrong_answers") || "Incorrect"}
								value={effectiveStats?.incorrect || 0}
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
								value={formatDuration(effectiveStats?.studyTimeSeconds || 0)}
								color={chartColors.info}
								delay={0.3}
							/>
							<StatCard
								icon={CalendarTodayIcon}
								title={t("sessions") || "Sessions"}
								value={effectiveStats?.sessions || 0}
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
										{filledChartData.grouping === "monthly" && (
											<Chip
												size="small"
												label={t("monthly") || "Monthly"}
												sx={{ ml: 1, fontSize: 11 }}
											/>
										)}
									</Typography>
									<Box sx={{ height: 300 }}>
										{filledChartData.data?.length > 0 ? (
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
										{filledChartData.data?.length > 0 ? (
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
										{filledChartData.data?.length > 0 ? (
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

								{effectiveCardsTable.length > 0 ? (
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
															direction={
																sortBy === "correct" ? sortOrder : "desc"
															}
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
															direction={
																sortBy === "wrong" ? sortOrder : "desc"
															}
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
															direction={
																sortBy === "accuracy" ? sortOrder : "desc"
															}
															onClick={() => handleSort("accuracy")}
														>
															{t("accuracy") || "Accuracy"}
														</TableSortLabel>
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{effectiveCardsTable.map((card) => (
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

						{/* Date range warning */}
						<Snackbar
							open={!!dateWarning}
							autoHideDuration={4000}
							onClose={() => setDateWarning("")}
							anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
						>
							<Alert
								onClose={() => setDateWarning("")}
								severity="warning"
								variant="filled"
								sx={{ width: "100%", color: "#fff" }}
							>
								{dateWarning}
							</Alert>
						</Snackbar>
					</Box>
					{/* end real content */}
				</Box>
				{/* end relative wrapper */}
			</MotionConfig>
		</PageContainer>
	);
}
