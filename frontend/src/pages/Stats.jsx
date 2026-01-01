import { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, useTheme } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StyleIcon from '@mui/icons-material/Style';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { I18nContext } from '../utils/i18n';
import { PageContainer, StyledCard, StatsSkeleton } from '../components/ui';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MotionBox = motion.create(Box);

// Stats card component
const StatCard = ({ icon: Icon, title, value, subtitle, color, delay }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <StyledCard variant="default" padding={3}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: color, fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: 'text.cardSubtitle',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: 'text.cardTitle',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.cardSubtitle',
                fontFamily: 'Inter, sans-serif',
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

export default function Stats({ accountId }) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock statistics data
      setStats({
        totalCards: 156,
        cardsStudied: 1247,
        correctRate: 78,
        streak: 5,
        studyHistory: [
          { date: 'Mon', cards: 45 },
          { date: 'Tue', cards: 32 },
          { date: 'Wed', cards: 58 },
          { date: 'Thu', cards: 41 },
          { date: 'Fri', cards: 67 },
          { date: 'Sat', cards: 23 },
          { date: 'Sun', cards: 51 },
        ],
        correctIncorrect: { correct: 972, incorrect: 275 },
        deckPerformance: [
          { name: 'JavaScript', accuracy: 85 },
          { name: 'React', accuracy: 72 },
          { name: 'Python', accuracy: 91 },
          { name: 'SQL', accuracy: 68 },
        ],
      });
      setLoading(false);
    };

    fetchStats();
  }, [accountId]);

  const chartColors = theme.palette.chart || {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#22c55e',
    error: '#ef4444',
    grid: 'rgba(255, 255, 255, 0.06)',
    text: '#94a3b8',
  };

  // Line chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        grid: {
          color: chartColors.grid,
        },
        ticks: {
          color: chartColors.text,
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      y: {
        grid: {
          color: chartColors.grid,
        },
        ticks: {
          color: chartColors.text,
          font: {
            family: 'Inter, sans-serif',
          },
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  // Line chart data
  const lineChartData = stats
    ? {
        labels: stats.studyHistory.map((d) => d.date),
        datasets: [
          {
            label: t('cards_studied') || 'Cards Studied',
            data: stats.studyHistory.map((d) => d.cards),
            borderColor: chartColors.primary,
            backgroundColor: `${chartColors.primary}20`,
            fill: true,
            pointBackgroundColor: chartColors.primary,
          },
        ],
      }
    : { labels: [], datasets: [] };

  // Doughnut chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartColors.text,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.cardTitle,
        bodyColor: theme.palette.text.cardSubtitle,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '70%',
  };

  // Doughnut chart data
  const doughnutData = stats
    ? {
        labels: [t('correct') || 'Correct', t('incorrect') || 'Incorrect'],
        datasets: [
          {
            data: [stats.correctIncorrect.correct, stats.correctIncorrect.incorrect],
            backgroundColor: [chartColors.success, chartColors.error],
            borderColor: 'transparent',
            borderWidth: 0,
          },
        ],
      }
    : { labels: [], datasets: [] };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.cardTitle,
        bodyColor: theme.palette.text.cardSubtitle,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: chartColors.text,
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      y: {
        grid: {
          color: chartColors.grid,
        },
        ticks: {
          color: chartColors.text,
          font: {
            family: 'Inter, sans-serif',
          },
          callback: (value) => `${value}%`,
        },
        beginAtZero: true,
        max: 100,
      },
    },
  };

  // Bar chart data
  const barChartData = stats
    ? {
        labels: stats.deckPerformance.map((d) => d.name),
        datasets: [
          {
            label: t('accuracy') || 'Accuracy',
            data: stats.deckPerformance.map((d) => d.accuracy),
            backgroundColor: [
              chartColors.primary,
              chartColors.secondary,
              chartColors.success,
              '#f59e0b',
            ],
            borderRadius: 8,
          },
        ],
      }
    : { labels: [], datasets: [] };

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
        sx={{ mb: 4 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.cardTitle',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <TrendingUpIcon sx={{ color: 'primary.light', fontSize: 32 }} />
          {t('statistics') || 'Statistics'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.cardSubtitle',
            mt: 0.5,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {t('stats_subtitle') || 'Track your learning progress'}
        </Typography>
      </MotionBox>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          icon={StyleIcon}
          title={t('total_cards') || 'Total Cards'}
          value={stats?.totalCards || 0}
          subtitle={t('across_all_decks') || 'Across all decks'}
          color={chartColors.primary}
          delay={0}
        />
        <StatCard
          icon={CheckCircleIcon}
          title={t('cards_studied') || 'Cards Studied'}
          value={stats?.cardsStudied || 0}
          subtitle={t('all_time') || 'All time'}
          color={chartColors.success}
          delay={0.1}
        />
        <StatCard
          icon={EmojiEventsIcon}
          title={t('success_rate') || 'Success Rate'}
          value={`${stats?.correctRate || 0}%`}
          subtitle={t('average_accuracy') || 'Average accuracy'}
          color={chartColors.secondary}
          delay={0.2}
        />
        <StatCard
          icon={WhatshotIcon}
          title={t('current_streak') || 'Current Streak'}
          value={`${stats?.streak || 0} ${t('days') || 'days'}`}
          subtitle={t('keep_going') || 'Keep going!'}
          color="#f59e0b"
          delay={0.3}
        />
      </Box>

      {/* Charts Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Line Chart */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <StyledCard variant="default" padding={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.cardTitle',
                fontFamily: 'Inter, sans-serif',
                mb: 3,
              }}
            >
              {t('study_activity') || 'Study Activity'}
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </Box>
          </StyledCard>
        </MotionBox>

        {/* Doughnut Chart */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <StyledCard variant="default" padding={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.cardTitle',
                fontFamily: 'Inter, sans-serif',
                mb: 3,
              }}
            >
              {t('correct_vs_incorrect') || 'Correct vs Incorrect'}
            </Typography>
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </Box>
          </StyledCard>
        </MotionBox>
      </Box>

      {/* Bar Chart */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <StyledCard variant="default" padding={3}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.cardTitle',
              fontFamily: 'Inter, sans-serif',
              mb: 3,
            }}
          >
            {t('deck_performance') || 'Deck Performance'}
          </Typography>
          <Box sx={{ height: 300 }}>
            <Bar data={barChartData} options={barChartOptions} />
          </Box>
        </StyledCard>
      </MotionBox>
    </PageContainer>
  );
}
