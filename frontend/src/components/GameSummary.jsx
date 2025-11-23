import React, { useContext } from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { I18nContext } from '../utils/i18n';

export default function GameSummary({ correctCount, incorrectCount, onRestart, onBackToDecks }) {
  const theme = useTheme();
  const totalCards = correctCount + incorrectCount;
  const percentage = Math.round((correctCount / totalCards) * 100);
  const { t } = useContext(I18nContext);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          width: '100%',
          maxWidth: 400,
          border: `1.5px solid ${theme.palette.border.main}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
          {t('game_summary') || 'Game Summary'}
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700, color: theme.palette.primary.main }}>
            {percentage}%
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
            {t('success_rate') || 'Success Rate'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
              {correctCount}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('correct') || 'Correct'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
              {incorrectCount}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('incorrect') || 'Incorrect'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {totalCards}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {t('total') || 'Total'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={onBackToDecks}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 4,
            fontWeight: 600
          }}
        >
          {t('back_to_decks') || 'Back to Decks'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ReplayIcon />}
          onClick={onRestart}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 4,
            fontWeight: 600
          }}
        >
          {t('play_again') || 'Play Again'}
        </Button>
      </Box>
    </Box>
  );
}