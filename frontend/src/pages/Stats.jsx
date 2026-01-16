import { useEffect, useState, useContext, useMemo, useCallback } from "react";
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
import { I18nContext } from "../utils/i18n";
import { PageContainer, StyledCard, StatsSkeleton } from "../components/ui";
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
	Filler
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
		[theme.palette.chart]
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
		[getDateRangeFromPreset]
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
		[sortBy]
	);

	// Refresh data
	const handleRefresh = useCallback(() => {
		if (activePreset) {
			handlePresetClick(activePreset);
		}
	}, [activePreset, handlePresetClick]);

	// Download report as HTML file
	const handleDownloadReport = useCallback(() => {
		if (!filteredStats) return;

		const total = (filteredStats.correct || 0) + (filteredStats.incorrect || 0);
		const accuracyPercent = total > 0 ? Math.round((filteredStats.correct / total) * 100) : 0;
		const hours = Math.floor((filteredStats.studyTimeSeconds || 0) / 3600);
		const minutes = Math.floor(((filteredStats.studyTimeSeconds || 0) % 3600) / 60);
		const studyTimeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

		const dateRangeText = dateRange[0] && dateRange[1]
			? `${dateRange[0].format("DD/MM/YYYY")} - ${dateRange[1].format("DD/MM/YYYY")}`
			: t("all_time") || "All Time";

		const selectedDeckName = selectedDeck === "all"
			? t("all_decks") || "All Decks"
			: decksData.find(d => d.id === selectedDeck)?.title || selectedDeck;

		const reportDate = dayjs().format("DD/MM/YYYY HH:mm");

		const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${t("statistics") || "Statistics"} Report</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
			color: #e2e8f0;
			min-height: 100vh;
			padding: 40px 20px;
		}
		.container {
			max-width: 800px;
			margin: 0 auto;
		}
		.header {
			text-align: center;
			margin-bottom: 40px;
			padding-bottom: 30px;
			border-bottom: 2px solid rgba(255,255,255,0.1);
		}
		.header h1 {
			font-size: 2.5rem;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			margin-bottom: 10px;
		}
		.header p {
			color: #94a3b8;
			font-size: 0.9rem;
		}
		.meta-info {
			display: flex;
			justify-content: center;
			gap: 30px;
			margin-top: 20px;
			flex-wrap: wrap;
		}
		.meta-item {
			background: rgba(255,255,255,0.05);
			padding: 10px 20px;
			border-radius: 20px;
			font-size: 0.85rem;
		}
		.meta-item span {
			color: #667eea;
			font-weight: 600;
		}
		.stats-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 20px;
			margin-bottom: 40px;
		}
		.stat-card {
			background: rgba(255,255,255,0.05);
			border-radius: 16px;
			padding: 24px;
			text-align: center;
			transition: transform 0.3s;
		}
		.stat-card:hover {
			transform: translateY(-5px);
		}
		.stat-value {
			font-size: 2.5rem;
			font-weight: 700;
			margin-bottom: 8px;
		}
		.stat-label {
			color: #94a3b8;
			font-size: 0.9rem;
			text-transform: uppercase;
			letter-spacing: 1px;
		}
		.stat-card.primary .stat-value { color: #3b82f6; }
		.stat-card.success .stat-value { color: #22c55e; }
		.stat-card.error .stat-value { color: #ef4444; }
		.stat-card.purple .stat-value { color: #8b5cf6; }
		.stat-card.info .stat-value { color: #06b6d4; }
		.stat-card.warning .stat-value { color: #f59e0b; }
		.accuracy-section {
			background: rgba(255,255,255,0.05);
			border-radius: 16px;
			padding: 30px;
			margin-bottom: 40px;
			text-align: center;
		}
		.accuracy-bar {
			height: 20px;
			background: rgba(239, 68, 68, 0.3);
			border-radius: 10px;
			overflow: hidden;
			margin: 20px 0;
		}
		.accuracy-fill {
			height: 100%;
			background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
			border-radius: 10px;
			transition: width 0.5s;
		}
		.accuracy-label {
			font-size: 3rem;
			font-weight: 700;
			background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}
		.cards-section {
			background: rgba(255,255,255,0.05);
			border-radius: 16px;
			padding: 30px;
		}
		.cards-section h3 {
			margin-bottom: 20px;
			color: #e2e8f0;
		}
		table {
			width: 100%;
			border-collapse: collapse;
		}
		th, td {
			padding: 12px;
			text-align: left;
			border-bottom: 1px solid rgba(255,255,255,0.1);
		}
		th {
			color: #94a3b8;
			font-weight: 600;
			text-transform: uppercase;
			font-size: 0.75rem;
			letter-spacing: 1px;
		}
		tr:hover {
			background: rgba(255,255,255,0.02);
		}
		.badge {
			padding: 4px 12px;
			border-radius: 12px;
			font-size: 0.8rem;
			font-weight: 600;
		}
		.badge-success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
		.badge-error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
		.footer {
			text-align: center;
			margin-top: 40px;
			padding-top: 30px;
			border-top: 2px solid rgba(255,255,255,0.1);
			color: #64748b;
			font-size: 0.85rem;
		}
		@media print {
			body { background: #1a1a2e; }
			.stat-card:hover { transform: none; }
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>${t("statistics") || "Statistics"} Report</h1>
			<p>${t("stats_subtitle") || "Track your learning progress"}</p>
			<div class="meta-info">
				<div class="meta-item"><span>${dateRangeText}</span></div>
				<div class="meta-item"><span>${selectedDeckName}</span></div>
				<div class="meta-item"><span>${reportDate}</span></div>
			</div>
		</div>

		<div class="stats-grid">
			<div class="stat-card primary">
				<div class="stat-value">${filteredStats.cardsStudied || 0}</div>
				<div class="stat-label">${t("cards_studied") || "Cards Studied"}</div>
			</div>
			<div class="stat-card success">
				<div class="stat-value">${filteredStats.correct || 0}</div>
				<div class="stat-label">${t("correct_answers") || "Correct"}</div>
			</div>
			<div class="stat-card error">
				<div class="stat-value">${filteredStats.incorrect || 0}</div>
				<div class="stat-label">${t("wrong_answers") || "Incorrect"}</div>
			</div>
			<div class="stat-card purple">
				<div class="stat-value">${accuracyPercent}%</div>
				<div class="stat-label">${t("accuracy") || "Accuracy"}</div>
			</div>
			<div class="stat-card info">
				<div class="stat-value">${studyTimeFormatted}</div>
				<div class="stat-label">${t("study_time") || "Study Time"}</div>
			</div>
			<div class="stat-card warning">
				<div class="stat-value">${filteredStats.sessions || 0}</div>
				<div class="stat-label">${t("sessions") || "Sessions"}</div>
			</div>
		</div>

		<div class="accuracy-section">
			<h3>${t("accuracy") || "Accuracy"}</h3>
			<div class="accuracy-label">${accuracyPercent}%</div>
			<div class="accuracy-bar">
				<div class="accuracy-fill" style="width: ${accuracyPercent}%"></div>
			</div>
			<p style="color: #94a3b8;">${filteredStats.correct || 0} ${t("correct") || "correct"} / ${total} ${t("total") || "total"}</p>
		</div>

		${cardsTable.length > 0 ? `
		<div class="cards-section">
			<h3>🃏 ${t("card_performance") || "Card Performance"} (Top 10)</h3>
			<table>
				<thead>
					<tr>
						<th>${t("card") || "Card"}</th>
						<th>${t("times_played") || "Played"}</th>
						<th>${t("correct") || "Correct"}</th>
						<th>${t("incorrect") || "Incorrect"}</th>
						<th>${t("accuracy") || "Accuracy"}</th>
					</tr>
				</thead>
				<tbody>
					${cardsTable.slice(0, 10).map(card => `
						<tr>
							<td>${(card.front || "").substring(0, 40)}${card.front?.length > 40 ? "..." : ""}</td>
							<td>${card.times_played || 0}</td>
							<td><span class="badge badge-success">${card.correct || 0}</span></td>
							<td><span class="badge badge-error">${card.wrong || 0}</span></td>
							<td>${card.accuracy || 0}%</td>
						</tr>
					`).join("")}
				</tbody>
			</table>
		</div>
		` : ""}

		<div class="footer">
			<p>Generated by Flashcard App • ${reportDate}</p>
		</div>
	</div>
</body>
</html>
		`;

		const blob = new Blob([htmlContent], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `stats-report-${dayjs().format("YYYY-MM-DD")}.html`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
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
		[theme, chartColors]
	);

	// Activity line chart data
	const activityChartData = useMemo(
		() => ({
			labels: (chartData.data || []).map((d) =>
				formatDateLabel(d.date, chartData.grouping)
			),
			datasets: [
				{
					label: t("cards_studied") || "Cards Studied",
					data: (chartData.data || []).map(
						(d) => parseInt(d.cardsStudied) || 0
					),
					borderColor: chartColors.primary,
					backgroundColor: `${chartColors.primary}20`,
					fill: true,
					pointBackgroundColor: chartColors.primary,
				},
			],
		}),
		[chartData, chartColors, t, formatDateLabel]
	);

	// Accuracy trend chart data
	const accuracyChartData = useMemo(
		() => ({
			labels: (chartData.data || []).map((d) =>
				formatDateLabel(d.date, chartData.grouping)
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
		[chartData, chartColors, t, formatDateLabel]
	);

	// Study time bar chart data
	const studyTimeChartData = useMemo(
		() => ({
			labels: (chartData.data || []).map((d) =>
				formatDateLabel(d.date, chartData.grouping)
			),
			datasets: [
				{
					label: t("study_time") || "Study Time (min)",
					data: (chartData.data || []).map((d) =>
						Math.round((parseInt(d.studyTimeSeconds) || 0) / 60)
					),
					backgroundColor: chartColors.secondary,
					borderRadius: 8,
				},
			],
		}),
		[chartData, chartColors, t, formatDateLabel]
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
		[chartColors]
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

			{/* Stats Cards */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, 1fr)",
						lg: "repeat(4, 1fr)",
					},
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
					// subtitle={`${filteredStats?.correct || 0}/${
					// 	(filteredStats?.correct || 0) + (filteredStats?.incorrect || 0)
					// }`}
					color={chartColors.secondary}
					delay={0.25}
				/>
			</Box>

			{/* Secondary Stats */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, 1fr)",
					},
					gap: 2,
					mb: 3,
				}}
			>
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
								<Line data={activityChartData} options={lineChartOptions} />
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

			{/* Charts Row 2 */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
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
								<Bar data={studyTimeChartData} options={barChartOptions} />
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
