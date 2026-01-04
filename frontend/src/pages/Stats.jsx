import { useEffect, useState, useContext, useMemo } from "react";
import { motion } from "framer-motion";
import {
	Box,
	Typography,
	useTheme,
	ToggleButtonGroup,
	ToggleButton,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Tabs,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	LinearProgress,
} from "@mui/material";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	Tooltip as ChartTooltip,
	Legend,
	Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StyleIcon from "@mui/icons-material/Style";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SchoolIcon from "@mui/icons-material/School";
import FolderIcon from "@mui/icons-material/Folder";
import StarIcon from "@mui/icons-material/Star";
import ErrorIcon from "@mui/icons-material/Error";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { I18nContext } from "../utils/i18n";
import { PageContainer, StyledCard, StatsSkeleton } from "../components/ui";
import {
	getOverviewStats,
	getDailyStats,
	getDecksStats,
	getDeckStats,
	getInsights,
} from "../services/statsServices";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	ChartTooltip,
	Legend,
	Filler
);

const MotionBox = motion.create(Box);

// Stats card component
const StatCard = ({
	icon: Icon,
	title,
	value,
	subtitle,
	color,
	delay,
	trend,
}) => (
	<MotionBox
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
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
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
						{trend !== undefined && trend !== 0 && (
							<Chip
								size="small"
								icon={
									trend > 0 ? (
										<ArrowUpwardIcon sx={{ fontSize: 14 }} />
									) : (
										<ArrowDownwardIcon sx={{ fontSize: 14 }} />
									)
								}
								label={`${Math.abs(trend)}%`}
								sx={{
									bgcolor: trend > 0 ? "success.main" : "error.main",
									color: "white",
									fontSize: 11,
									height: 22,
									"& .MuiChip-icon": { color: "white" },
								}}
							/>
						)}
					</Box>
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

// Insight card component
const InsightCard = ({ icon: Icon, title, value, color }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 2,
			p: 2,
			borderRadius: 2,
			bgcolor: `${color}10`,
			border: `1px solid ${color}30`,
		}}
	>
		<Icon sx={{ color, fontSize: 28 }} />
		<Box>
			<Typography
				variant="caption"
				sx={{ color: "text.cardSubtitle", display: "block" }}
			>
				{title}
			</Typography>
			<Typography
				variant="body1"
				sx={{ color: "text.cardTitle", fontWeight: 600 }}
			>
				{value}
			</Typography>
		</Box>
	</Box>
);

export default function Stats() {
	const theme = useTheme();
	const { t } = useContext(I18nContext);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState(0);
	const [period, setPeriod] = useState("30d");
	const [selectedDeck, setSelectedDeck] = useState("all");

	// Data states
	const [overview, setOverview] = useState(null);
	const [dailyData, setDailyData] = useState([]);
	const [decksData, setDecksData] = useState([]);
	const [deckDetail, setDeckDetail] = useState(null);
	const [insights, setInsights] = useState(null);

	// Fetch all stats
	useEffect(() => {
		const fetchAllStats = async () => {
			setLoading(true);
			try {
				const [overviewRes, dailyRes, decksRes, insightsRes] =
					await Promise.all([
						getOverviewStats(),
						getDailyStats(period),
						getDecksStats(),
						getInsights(),
					]);

				setOverview(overviewRes);
				setDailyData(dailyRes.daily || []);
				setDecksData(decksRes.decks || []);
				setInsights(insightsRes);
			} catch (err) {
				console.error("Failed to fetch stats:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchAllStats();
	}, []);

	// Refetch daily data when period changes
	useEffect(() => {
		const fetchDaily = async () => {
			try {
				const dailyRes = await getDailyStats(period);
				setDailyData(dailyRes.daily || []);
			} catch (err) {
				console.error("Failed to fetch daily stats:", err);
			}
		};
		if (!loading) fetchDaily();
	}, [period]);

	// Fetch deck detail when selected
	useEffect(() => {
		const fetchDeckDetail = async () => {
			if (selectedDeck === "all") {
				setDeckDetail(null);
				return;
			}
			try {
				const res = await getDeckStats(selectedDeck, period);
				setDeckDetail(res);
			} catch (err) {
				console.error("Failed to fetch deck detail:", err);
			}
		};
		fetchDeckDetail();
	}, [selectedDeck, period]);

	// Calculate weekly trend
	const weeklyTrend = useMemo(() => {
		if (!insights?.weeklyComparison) return 0;
		const { current, previous } = insights.weeklyComparison;
		if (previous.cards === 0) return current.cards > 0 ? 100 : 0;
		return Math.round(
			((current.cards - previous.cards) / previous.cards) * 100
		);
	}, [insights]);

	const chartColors = theme.palette.chart || {
		primary: "#3b82f6",
		secondary: "#8b5cf6",
		success: "#22c55e",
		error: "#ef4444",
		grid: "rgba(255, 255, 255, 0.06)",
		text: "#94a3b8",
	};

	// Format duration
	const formatDuration = (seconds) => {
		if (!seconds) return "0m";
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	};

	// Format date for display
	const formatDate = (dateStr) => {
		if (!dateStr) return "-";
		const date = new Date(dateStr);
		return date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		});
	};

	// Line chart options
	const lineChartOptions = {
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
	};

	// Line chart data
	const lineChartData = {
		labels: dailyData.map((d) => formatDate(d.date)),
		datasets: [
			{
				label: t("cards_studied") || "Cards Studied",
				data: dailyData.map((d) => parseInt(d.cards_studied) || 0),
				borderColor: chartColors.primary,
				backgroundColor: `${chartColors.primary}20`,
				fill: true,
				pointBackgroundColor: chartColors.primary,
			},
		],
	};

	// Accuracy line chart data
	const accuracyChartData = {
		labels: dailyData.map((d) => formatDate(d.date)),
		datasets: [
			{
				label: t("correct") || "Correct",
				data: dailyData.map((d) => parseInt(d.correct) || 0),
				borderColor: chartColors.success,
				backgroundColor: `${chartColors.success}20`,
				fill: false,
				pointBackgroundColor: chartColors.success,
			},
			{
				label: t("incorrect") || "Incorrect",
				data: dailyData.map((d) => parseInt(d.wrong) || 0),
				borderColor: chartColors.error,
				backgroundColor: `${chartColors.error}20`,
				fill: false,
				pointBackgroundColor: chartColors.error,
			},
		],
	};

	// Doughnut chart options
	const doughnutOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom",
				labels: {
					color: chartColors.text,
					font: { family: "Inter", size: 12 },
					padding: 20,
				},
			},
		},
		cutout: "70%",
	};

	// Doughnut chart data
	const doughnutData = {
		labels: [t("correct") || "Correct", t("incorrect") || "Incorrect"],
		datasets: [
			{
				data: [overview?.totalCorrect || 0, overview?.totalWrong || 0],
				backgroundColor: [chartColors.success, chartColors.error],
				borderColor: "transparent",
				borderWidth: 0,
			},
		],
	};

	// Bar chart options
	const barChartOptions = {
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
					callback: (value) => `${value}%`,
				},
				beginAtZero: true,
				max: 100,
			},
		},
	};

	// Bar chart data (deck performance)
	const barChartData = {
		labels: decksData.slice(0, 8).map((d) => d.title.substring(0, 12)),
		datasets: [
			{
				label: t("accuracy") || "Accuracy",
				data: decksData.slice(0, 8).map((d) => parseFloat(d.accuracy) || 0),
				backgroundColor: [
					chartColors.primary,
					chartColors.secondary,
					chartColors.success,
					"#f59e0b",
					"#06b6d4",
					"#ec4899",
					"#84cc16",
					"#6366f1",
				],
				borderRadius: 8,
			},
		],
	};

	// Study time bar chart
	const studyTimeData = {
		labels: dailyData.slice(-7).map((d) => formatDate(d.date)),
		datasets: [
			{
				label: t("study_time") || "Study Time (min)",
				data: dailyData
					.slice(-7)
					.map((d) => Math.round((parseInt(d.study_time) || 0) / 60)),
				backgroundColor: chartColors.secondary,
				borderRadius: 8,
			},
		],
	};

	if (loading) {
		return (
			<PageContainer>
				<StatsSkeleton />
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			{/* Header */}
			<MotionBox
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				sx={{ mb: 3 }}
			>
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

					{/* Period Filter */}
					<ToggleButtonGroup
						value={period}
						exclusive
						onChange={(e, val) => val && setPeriod(val)}
						size="small"
						sx={{
							"& .MuiToggleButton-root": {
								border: "1px solid",
								borderColor: "divider",
								color: "text.cardSubtitle",
								"&.Mui-selected": {
									bgcolor: "primary.main",
									color: "white",
									"&:hover": { bgcolor: "primary.dark" },
								},
							},
						}}
					>
						<ToggleButton value="7d">{t("7_days") || "7D"}</ToggleButton>
						<ToggleButton value="30d">{t("30_days") || "30D"}</ToggleButton>
						<ToggleButton value="90d">{t("90_days") || "90D"}</ToggleButton>
						<ToggleButton value="365d">{t("1_year") || "1Y"}</ToggleButton>
						<ToggleButton value="all">
							{t("all_time_short") || "All"}
						</ToggleButton>
					</ToggleButtonGroup>
				</Box>
			</MotionBox>

			{/* Top Stats Cards */}
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
					icon={StyleIcon}
					title={t("total_cards") || "Total Cards"}
					value={overview?.totalCards || 0}
					subtitle={`${overview?.totalDecks || 0} ${t("decks") || "decks"}`}
					color={chartColors.primary}
					delay={0}
				/>
				<StatCard
					icon={SchoolIcon}
					title={t("cards_studied") || "Cards Studied"}
					value={overview?.totalCardsStudied || 0}
					subtitle={`${overview?.totalSessions || 0} ${
						t("sessions") || "sessions"
					}`}
					color={chartColors.success}
					delay={0.1}
					trend={weeklyTrend}
				/>
				<StatCard
					icon={EmojiEventsIcon}
					title={t("accuracy") || "Accuracy"}
					value={`${overview?.accuracy || 0}%`}
					subtitle={`${overview?.totalCorrect || 0}/${
						(overview?.totalCorrect || 0) + (overview?.totalWrong || 0)
					}`}
					color={chartColors.secondary}
					delay={0.2}
				/>
				<StatCard
					icon={WhatshotIcon}
					title={t("current_streak") || "Current Streak"}
					value={`${overview?.currentStreak || 0} ${t("days") || "days"}`}
					subtitle={`${t("best") || "Best"}: ${overview?.longestStreak || 0} ${
						t("days") || "days"
					}`}
					color="#f59e0b"
					delay={0.3}
				/>
			</Box>

			{/* Secondary Stats */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, 1fr)",
						md: "repeat(4, 1fr)",
					},
					gap: 2,
					mb: 3,
				}}
			>
				<StatCard
					icon={AccessTimeIcon}
					title={t("study_time") || "Study Time"}
					value={formatDuration(overview?.totalStudyTime)}
					color="#06b6d4"
					delay={0.4}
				/>
				<StatCard
					icon={CheckCircleIcon}
					title={t("correct_answers") || "Correct Answers"}
					value={overview?.totalCorrect || 0}
					subtitle=" "
					color={chartColors.success}
					delay={0.5}
				/>
				<StatCard
					icon={ErrorIcon}
					title={t("wrong_answers") || "Wrong Answers"}
					value={overview?.totalWrong || 0}
					subtitle=" "
					color={chartColors.error}
					delay={0.6}
				/>
				<StatCard
					icon={CalendarTodayIcon}
					title={t("avg_session") || "Avg Session"}
					value={formatDuration(overview?.avgSessionDuration)}
					subtitle=" "
					color="#ec4899"
					delay={0.7}
				/>
			</Box>

			{/* Insights Row */}
			{insights && (
				<MotionBox
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					sx={{ mb: 3 }}
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
							<LightbulbIcon sx={{ color: "#f59e0b" }} />
							{t("insights") || "Insights"}
						</Typography>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "repeat(2, 1fr)",
									md: "repeat(4, 1fr)",
								},
								gap: 2,
							}}
						>
							{insights.bestHour && (
								<InsightCard
									icon={AccessTimeIcon}
									title={t("best_study_hour") || "Best Study Hour"}
									value={`${insights.bestHour.hour}:00 (${insights.bestHour.accuracy}%)`}
									color="#06b6d4"
								/>
							)}
							{insights.bestDay && (
								<InsightCard
									icon={CalendarTodayIcon}
									title={t("best_study_day") || "Best Study Day"}
									value={`${insights.bestDay.day} (${insights.bestDay.accuracy}%)`}
									color="#8b5cf6"
								/>
							)}
							{insights.mostActiveMode && (
								<InsightCard
									icon={StarIcon}
									title={t("favorite_mode") || "Favorite Mode"}
									value={insights.mostActiveMode.game_mode || "Standard"}
									color="#22c55e"
								/>
							)}
							{overview?.bestDeck && (
								<InsightCard
									icon={FolderIcon}
									title={t("best_deck") || "Best Deck"}
									value={`${overview.bestDeck.title} (${overview.bestDeck.accuracy}%)`}
									color="#3b82f6"
								/>
							)}
						</Box>
					</StyledCard>
				</MotionBox>
			)}

			{/* Tabs */}
			<Box sx={{ mb: 3 }}>
				<Tabs
					value={activeTab}
					onChange={(e, v) => setActiveTab(v)}
					sx={{
						"& .MuiTab-root": {
							color: "text.cardSubtitle",
							fontFamily: "Inter",
							textTransform: "none",
							fontWeight: 500,
						},
						"& .Mui-selected": { color: "primary.main" },
					}}
				>
					<Tab label={t("overview") || "Overview"} />
					<Tab label={t("decks") || "Decks"} />
					<Tab label={t("activity") || "Activity"} />
				</Tabs>
			</Box>

			{/* Tab Content */}
			{activeTab === 0 && (
				<>
					{/* Charts Row 1 */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
							gap: 3,
							mb: 3,
						}}
					>
						<MotionBox
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
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
								</Typography>
								<Box sx={{ height: 300 }}>
									<Line data={lineChartData} options={lineChartOptions} />
								</Box>
							</StyledCard>
						</MotionBox>

						<MotionBox
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
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
									{t("correct_vs_incorrect") || "Correct vs Incorrect"}
								</Typography>
								<Box
									sx={{
										height: 300,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Doughnut data={doughnutData} options={doughnutOptions} />
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
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
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
								</Box>
							</StyledCard>
						</MotionBox>

						<MotionBox
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
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
									{t("study_time_chart") || "Study Time (Last 7 Days)"}
								</Typography>
								<Box sx={{ height: 280 }}>
									<Bar
										data={studyTimeData}
										options={{
											...barChartOptions,
											scales: {
												...barChartOptions.scales,
												y: {
													...barChartOptions.scales.y,
													ticks: {
														...barChartOptions.scales.y.ticks,
														callback: (v) => `${v}m`,
													},
													max: undefined,
												},
											},
										}}
									/>
								</Box>
							</StyledCard>
						</MotionBox>
					</Box>

					{/* Deck Performance */}
					<MotionBox
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
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
								{t("deck_performance") || "Deck Performance"}
							</Typography>
							<Box sx={{ height: 300 }}>
								<Bar data={barChartData} options={barChartOptions} />
							</Box>
						</StyledCard>
					</MotionBox>
				</>
			)}

			{activeTab === 1 && (
				<>
					{/* Deck Selector */}
					<Box sx={{ mb: 3 }}>
						<FormControl size="small" sx={{ minWidth: 200 }}>
							<InputLabel>{t("select_deck") || "Select Deck"}</InputLabel>
							<Select
								value={selectedDeck}
								label={t("select_deck") || "Select Deck"}
								onChange={(e) => setSelectedDeck(e.target.value)}
							>
								<MenuItem value="all">{t("all_decks") || "All Decks"}</MenuItem>
								{decksData.map((deck) => (
									<MenuItem key={deck.id} value={deck.id}>
										{deck.title}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>

					{selectedDeck === "all" ? (
						/* All Decks Table */
						<StyledCard variant="default" padding={3}>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 600,
									color: "text.cardTitle",
									fontFamily: "Inter",
									mb: 2,
								}}
							>
								{t("all_decks_stats") || "All Decks Statistics"}
							</Typography>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell sx={{ color: "text.cardSubtitle" }}>
												{t("deck_title") || "Deck"}
											</TableCell>
											<TableCell
												align="center"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("cards") || "Cards"}
											</TableCell>
											<TableCell
												align="center"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("sessions") || "Sessions"}
											</TableCell>
											<TableCell
												align="center"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("correct") || "Correct"}
											</TableCell>
											<TableCell
												align="center"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("incorrect") || "Incorrect"}
											</TableCell>
											<TableCell
												align="center"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("accuracy") || "Accuracy"}
											</TableCell>
											<TableCell
												align="center"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("last_studied") || "Last Studied"}
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{decksData.map((deck) => (
											<TableRow
												key={deck.id}
												hover
												onClick={() => setSelectedDeck(deck.id)}
												sx={{ cursor: "pointer" }}
											>
												<TableCell sx={{ color: "text.cardTitle" }}>
													{deck.title}
												</TableCell>
												<TableCell
													align="center"
													sx={{ color: "text.cardTitle" }}
												>
													{deck.card_count}
												</TableCell>
												<TableCell
													align="center"
													sx={{ color: "text.cardTitle" }}
												>
													{deck.session_count || 0}
												</TableCell>
												<TableCell align="center">
													<Chip
														size="small"
														label={deck.total_correct || 0}
														sx={{ bgcolor: "success.main", color: "white" }}
													/>
												</TableCell>
												<TableCell align="center">
													<Chip
														size="small"
														label={deck.total_wrong || 0}
														sx={{ bgcolor: "error.main", color: "white" }}
													/>
												</TableCell>
												<TableCell align="center">
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<LinearProgress
															variant="determinate"
															value={parseFloat(deck.accuracy) || 0}
															sx={{
																width: 60,
																height: 6,
																borderRadius: 3,
																bgcolor: "action.hover",
																"& .MuiLinearProgress-bar": {
																	bgcolor:
																		deck.accuracy >= 80
																			? "success.main"
																			: deck.accuracy >= 50
																			? "warning.main"
																			: "error.main",
																},
															}}
														/>
														<Typography
															variant="body2"
															sx={{ color: "text.cardTitle", minWidth: 40 }}
														>
															{deck.accuracy}%
														</Typography>
													</Box>
												</TableCell>
												<TableCell
													align="center"
													sx={{ color: "text.cardSubtitle" }}
												>
													{deck.last_studied
														? formatDate(deck.last_studied)
														: "-"}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</StyledCard>
					) : (
						/* Single Deck Detail */
						deckDetail && (
							<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
								{/* Deck Header */}
								<StyledCard variant="default" padding={3}>
									<Typography
										variant="h5"
										sx={{
											fontWeight: 700,
											color: "text.cardTitle",
											fontFamily: "Inter",
											mb: 1,
										}}
									>
										{deckDetail.deck?.title}
									</Typography>
									<Typography
										variant="body2"
										sx={{ color: "text.cardSubtitle", mb: 2 }}
									>
										{deckDetail.deck?.description || t("no_description")}
									</Typography>

									<Box
										sx={{
											display: "grid",
											gridTemplateColumns:
												"repeat(auto-fit, minmax(120px, 1fr))",
											gap: 2,
										}}
									>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h4"
												sx={{ color: "primary.main", fontWeight: 700 }}
											>
												{deckDetail.deck?.card_count || 0}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("total_cards")}
											</Typography>
										</Box>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h4"
												sx={{ color: "success.main", fontWeight: 700 }}
											>
												{deckDetail.stats?.totalCorrect || 0}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("correct")}
											</Typography>
										</Box>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h4"
												sx={{ color: "error.main", fontWeight: 700 }}
											>
												{deckDetail.stats?.totalWrong || 0}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("incorrect")}
											</Typography>
										</Box>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h4"
												sx={{ color: "secondary.main", fontWeight: 700 }}
											>
												{deckDetail.stats?.accuracy || 0}%
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("accuracy")}
											</Typography>
										</Box>
									</Box>
								</StyledCard>

								{/* Card Distribution */}
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
										gap: 2,
									}}
								>
									<StyledCard variant="default" padding={2}>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h3"
												sx={{ color: "success.main", fontWeight: 700 }}
											>
												{deckDetail.stats?.easyCards || 0}
											</Typography>
											<Typography
												variant="body2"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("easy_cards") || "Easy Cards"}
											</Typography>
										</Box>
									</StyledCard>
									<StyledCard variant="default" padding={2}>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h3"
												sx={{ color: "error.main", fontWeight: 700 }}
											>
												{deckDetail.stats?.hardCards || 0}
											</Typography>
											<Typography
												variant="body2"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("hard_cards") || "Hard Cards"}
											</Typography>
										</Box>
									</StyledCard>
									<StyledCard variant="default" padding={2}>
										<Box sx={{ textAlign: "center" }}>
											<Typography
												variant="h3"
												sx={{ color: "text.cardSubtitle", fontWeight: 700 }}
											>
												{deckDetail.stats?.unstudiedCards || 0}
											</Typography>
											<Typography
												variant="body2"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("unstudied_cards") || "Unstudied"}
											</Typography>
										</Box>
									</StyledCard>
								</Box>

								{/* Hardest & Easiest Cards */}
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
										gap: 3,
									}}
								>
									<StyledCard variant="default" padding={3}>
										<Typography
											variant="h6"
											sx={{
												fontWeight: 600,
												color: "error.main",
												fontFamily: "Inter",
												mb: 2,
												display: "flex",
												alignItems: "center",
												gap: 1,
											}}
										>
											<TrendingDownIcon />
											{t("hardest_cards") || "Hardest Cards"}
										</Typography>
										{deckDetail.hardestCards?.length > 0 ? (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													gap: 1,
												}}
											>
												{deckDetail.hardestCards.map((card) => (
													<Box
														key={card.id}
														sx={{
															p: 1.5,
															borderRadius: 1,
															bgcolor: "action.hover",
															display: "flex",
															justifyContent: "space-between",
															alignItems: "center",
														}}
													>
														<Typography
															variant="body2"
															sx={{
																color: "text.cardTitle",
																flex: 1,
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
															}}
														>
															{card.front_text}
														</Typography>
														<Chip
															size="small"
															label={`${card.error_rate}% ${
																t("error_rate") || "errors"
															}`}
															sx={{
																bgcolor: "error.main",
																color: "white",
																ml: 1,
															}}
														/>
													</Box>
												))}
											</Box>
										) : (
											<Typography
												variant="body2"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("no_data") || "No data yet"}
											</Typography>
										)}
									</StyledCard>

									<StyledCard variant="default" padding={3}>
										<Typography
											variant="h6"
											sx={{
												fontWeight: 600,
												color: "success.main",
												fontFamily: "Inter",
												mb: 2,
												display: "flex",
												alignItems: "center",
												gap: 1,
											}}
										>
											<TrendingUpIcon />
											{t("easiest_cards") || "Easiest Cards"}
										</Typography>
										{deckDetail.easiestCards?.length > 0 ? (
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													gap: 1,
												}}
											>
												{deckDetail.easiestCards.map((card) => (
													<Box
														key={card.id}
														sx={{
															p: 1.5,
															borderRadius: 1,
															bgcolor: "action.hover",
															display: "flex",
															justifyContent: "space-between",
															alignItems: "center",
														}}
													>
														<Typography
															variant="body2"
															sx={{
																color: "text.cardTitle",
																flex: 1,
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
															}}
														>
															{card.front_text}
														</Typography>
														<Chip
															size="small"
															label={`${card.success_rate}%`}
															sx={{
																bgcolor: "success.main",
																color: "white",
																ml: 1,
															}}
														/>
													</Box>
												))}
											</Box>
										) : (
											<Typography
												variant="body2"
												sx={{ color: "text.cardSubtitle" }}
											>
												{t("no_data") || "No data yet"}
											</Typography>
										)}
									</StyledCard>
								</Box>
							</Box>
						)
					)}
				</>
			)}

			{activeTab === 2 && (
				<>
					{/* Weekly Comparison */}
					{insights?.weeklyComparison && (
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
								gap: 3,
								mb: 3,
							}}
						>
							<StyledCard variant="default" padding={3}>
								<Typography
									variant="h6"
									sx={{
										fontWeight: 600,
										color: "text.cardTitle",
										fontFamily: "Inter",
										mb: 2,
									}}
								>
									{t("this_week") || "This Week"}
								</Typography>
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: "repeat(3, 1fr)",
										gap: 2,
									}}
								>
									<Box sx={{ textAlign: "center" }}>
										<Typography
											variant="h4"
											sx={{ color: "primary.main", fontWeight: 700 }}
										>
											{insights.weeklyComparison.current.cards}
										</Typography>
										<Typography
											variant="caption"
											sx={{ color: "text.cardSubtitle" }}
										>
											{t("cards_studied")}
										</Typography>
									</Box>
									<Box sx={{ textAlign: "center" }}>
										<Typography
											variant="h4"
											sx={{ color: "success.main", fontWeight: 700 }}
										>
											{insights.weeklyComparison.current.correct}
										</Typography>
										<Typography
											variant="caption"
											sx={{ color: "text.cardSubtitle" }}
										>
											{t("correct")}
										</Typography>
									</Box>
									<Box sx={{ textAlign: "center" }}>
										<Typography
											variant="h4"
											sx={{ color: "error.main", fontWeight: 700 }}
										>
											{insights.weeklyComparison.current.wrong}
										</Typography>
										<Typography
											variant="caption"
											sx={{ color: "text.cardSubtitle" }}
										>
											{t("incorrect")}
										</Typography>
									</Box>
								</Box>
							</StyledCard>

							<StyledCard variant="default" padding={3}>
								<Typography
									variant="h6"
									sx={{
										fontWeight: 600,
										color: "text.cardTitle",
										fontFamily: "Inter",
										mb: 2,
									}}
								>
									{t("last_week") || "Last Week"}
								</Typography>
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: "repeat(3, 1fr)",
										gap: 2,
									}}
								>
									<Box sx={{ textAlign: "center" }}>
										<Typography
											variant="h4"
											sx={{ color: "primary.main", fontWeight: 700 }}
										>
											{insights.weeklyComparison.previous.cards}
										</Typography>
										<Typography
											variant="caption"
											sx={{ color: "text.cardSubtitle" }}
										>
											{t("cards_studied")}
										</Typography>
									</Box>
									<Box sx={{ textAlign: "center" }}>
										<Typography
											variant="h4"
											sx={{ color: "success.main", fontWeight: 700 }}
										>
											{insights.weeklyComparison.previous.correct}
										</Typography>
										<Typography
											variant="caption"
											sx={{ color: "text.cardSubtitle" }}
										>
											{t("correct")}
										</Typography>
									</Box>
									<Box sx={{ textAlign: "center" }}>
										<Typography
											variant="h4"
											sx={{ color: "error.main", fontWeight: 700 }}
										>
											{insights.weeklyComparison.previous.wrong}
										</Typography>
										<Typography
											variant="caption"
											sx={{ color: "text.cardSubtitle" }}
										>
											{t("incorrect")}
										</Typography>
									</Box>
								</Box>
							</StyledCard>
						</Box>
					)}

					{/* Activity Chart */}
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
							{t("daily_activity") || "Daily Activity"}
						</Typography>
						<Box sx={{ height: 350 }}>
							<Line data={lineChartData} options={lineChartOptions} />
						</Box>
					</StyledCard>
				</>
			)}
		</PageContainer>
	);
}
