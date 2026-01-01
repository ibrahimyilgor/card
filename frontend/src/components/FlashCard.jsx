import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, useTheme } from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp';

const MotionBox = motion.create(Box);

export default function FlashCard({ front, back, isFlipped, onFlip }) {
  const theme = useTheme();

  const cardVariants = {
    front: {
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      },
    },
    back: {
      rotateY: 180,
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.3,
      },
    },
  };

  return (
    <Box
      sx={{
        perspective: '1200px',
        width: { xs: '320px', sm: '420px', md: '480px' },
        height: { xs: '220px', sm: '280px', md: '320px' },
      }}
    >
      <MotionBox
        onClick={onFlip}
        variants={cardVariants}
        animate={isFlipped ? 'back' : 'front'}
        initial="front"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        sx={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          position: 'relative',
          transformStyle: 'preserve-3d',
          borderRadius: '20px',
        }}
      >
        {/* Front side */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: '20px',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1a1f2e 0%, #111827 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(59, 130, 246, 0.15)'
              }`,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                : '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            overflow: 'hidden',
          }}
        >
          {/* Gradient accent line */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
            }}
          />

          <AnimatePresence mode="wait">
            {!isFlipped && (
              <MotionBox
                key="front-content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                sx={{
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: 'text.cardTitle',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                  }}
                >
                  {front}
                </Typography>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Tap hint */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.cardSubtitle',
              opacity: 0.6,
            }}
          >
            <TouchAppIcon sx={{ fontSize: 16 }} />
            <Typography
              variant="caption"
              sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem' }}
            >
              Tap to flip
            </Typography>
          </Box>
        </Box>

        {/* Back side */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '20px',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
                : 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'rgba(34, 197, 94, 0.15)'
              }`,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                : '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            overflow: 'hidden',
          }}
        >
          {/* Gradient accent line */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #22c55e 0%, #10b981 100%)',
            }}
          />

          <AnimatePresence mode="wait">
            {isFlipped && (
              <MotionBox
                key="back-content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                sx={{
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'success.light',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.7rem',
                    mb: 2,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Answer
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: 'text.cardTitle',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                  }}
                >
                  {back}
                </Typography>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Tap hint */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.cardSubtitle',
              opacity: 0.6,
            }}
          >
            <TouchAppIcon sx={{ fontSize: 16 }} />
            <Typography
              variant="caption"
              sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem' }}
            >
              Tap to flip back
            </Typography>
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
}