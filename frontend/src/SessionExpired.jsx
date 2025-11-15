import { useEffect, useContext } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { I18nContext } from './i18n';

export default function SessionExpired() {
  const { t } = useContext(I18nContext);
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/'; // Ana giriş sayfasına yönlendir
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3, textAlign: 'center', maxWidth: 400 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }} color="error">
          {t('session_expired') || 'Oturumunuzun süresi doldu'}
        </Typography>
        <Typography variant="body1" color="text.primary">
          {t('redirecting_to_login') || 'Giriş sayfasına yönlendiriliyorsunuz...'}
        </Typography>
      </Paper>
    </Box>
  );
}
