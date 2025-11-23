import { useEffect, useContext } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { I18nContext } from '../utils/i18n';

export default function SessionExpired() {
  const { t } = useContext(I18nContext);
  const theme = useTheme();
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 2.5,
          textAlign: 'center',
          maxWidth: 400,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          border: `1.5px solid ${theme.palette.border.main}`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.text.cardTitle,
            letterSpacing: 0.5,
          }}
        >
          {t('session_expired') || 'Oturumunuzun süresi doldu'}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.cardTitle,
            fontWeight: 500,
            mb: 2,
          }}
        >
          {t('redirecting_to_login') || 'Giriş sayfasına yönlendiriliyorsunuz...'}
        </Typography>
    
      </Paper>
    </Box>
  );
}
