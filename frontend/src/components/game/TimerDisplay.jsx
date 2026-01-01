import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import TimerIcon from '@mui/icons-material/Timer';

const MotionBox = motion.create(Box);

export default function TimerDisplay({ timeLeft, totalTime = 10 }) {
  const percentage = (timeLeft / totalTime) * 100;
  const isWarning = timeLeft <= 3;
  const isCritical = timeLeft <= 1;

  const getColor = () => {
    if (isCritical) return '#ef4444';
    if (isWarning) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <MotionBox
      initial={{ scale: 0 }}
      animate={{ 
        scale: 1,
        ...(isWarning && { 
          scale: [1, 1.1, 1],
          transition: { repeat: Infinity, duration: 0.5 }
        })
      }}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background circle */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={64}
        thickness={4}
        sx={{
          color: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)',
        }}
      />
      
      {/* Progress circle */}
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={64}
        thickness={4}
        sx={{
          color: getColor(),
          position: 'absolute',
          left: 0,
          transition: 'color 0.3s ease',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 0.3s ease',
          },
        }}
      />
      
      {/* Center content */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: getColor(),
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.25rem',
            lineHeight: 1,
          }}
        >
          {timeLeft}
        </Typography>
      </Box>
    </MotionBox>
  );
}
