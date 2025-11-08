import React, { useState } from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';

export default function FlashCard({ front, back, isFlipped, onFlip }) {
  const theme = useTheme();

  return (
    <Box sx={{ perspective: '1000px' }}>
      <Paper
        onClick={onFlip}
        sx={{
          width: { xs: '300px', sm: '400px' },
          height: { xs: '200px', sm: '250px' },
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          borderRadius: 4,
          bgcolor: theme.palette.background.paper,
          border: `1.5px solid ${theme.palette.border.main}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          transformStyle: 'preserve-3d',
        }}
      >
        <Box sx={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          transition: 'transform 0.6s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              textAlign: 'center',
              opacity: 0,
              animation: isFlipped ? 'fadeInDelayed 0.1s forwards' : 'fadeIn 0.1s forwards',
              animationDelay: '0.3s',
              '@keyframes fadeInDelayed': {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 }
              },
              '@keyframes fadeIn': {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 }
              }
            }}
          >
            {isFlipped ? back : front}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}