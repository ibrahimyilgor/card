import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

export const CardSkeleton = ({ count = 1, sx = {} }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MotionBox
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.02)',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(0, 0, 0, 0.06)'}`,
            padding: 3,
            ...sx,
          }}
        >
          <Skeleton 
            variant="text" 
            width="60%" 
            height={32}
            sx={{ 
              bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.08)',
              borderRadius: '8px',
            }} 
          />
          <Skeleton 
            variant="text" 
            width="80%" 
            height={20}
            sx={{ 
              bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.06)' 
                : 'rgba(0, 0, 0, 0.06)',
              borderRadius: '6px',
              mt: 1,
            }} 
          />
          <Skeleton 
            variant="text" 
            width="40%" 
            height={20}
            sx={{ 
              bgcolor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.04)' 
                : 'rgba(0, 0, 0, 0.04)',
              borderRadius: '6px',
              mt: 0.5,
            }} 
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton 
                key={i}
                variant="circular" 
                width={36} 
                height={36}
                sx={{ 
                  bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.06)' 
                    : 'rgba(0, 0, 0, 0.06)',
                }} 
              />
            ))}
          </Box>
        </MotionBox>
      ))}
    </>
  );
};

export const StatsSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <MotionBox
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            sx={{
              borderRadius: '16px',
              padding: 3,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.06)'}`,
            }}
          >
            <Skeleton variant="text" width="50%" height={24} sx={{ borderRadius: '6px' }} />
            <Skeleton variant="text" width="70%" height={40} sx={{ borderRadius: '8px', mt: 1 }} />
          </MotionBox>
        ))}
      </Box>
      <Skeleton 
        variant="rectangular" 
        height={300} 
        sx={{ 
          borderRadius: '16px',
          bgcolor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.03)' 
            : 'rgba(0, 0, 0, 0.02)',
        }} 
      />
    </Box>
  );
};

export const PageSkeleton = () => {
  return (
    <Box sx={{ padding: 4 }}>
      <Skeleton variant="text" width="200px" height={40} sx={{ borderRadius: '8px', mb: 4 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
        <CardSkeleton count={6} />
      </Box>
    </Box>
  );
};

export default CardSkeleton;
