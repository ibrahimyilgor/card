import { Box, Button, Divider, FormControlLabel, Paper, Radio, RadioGroup, Typography, useTheme, Snackbar, Alert } from "@mui/material";
import { useContext, useState } from "react";
import Topbar from "./Topbar";
import { I18nContext } from "./i18n";

export default function Settings({ currentTheme, onThemeChange, onLangChange, onLogout, onSettings, onMainPage }) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'dark');
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('lang') || 'en');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleThemeChangeLocal = (e) => {
    setSelectedTheme(e.target.value);
  };
  const handleLangChange = (e) => {
    setSelectedLang(e.target.value);
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Update theme
      const themeRes = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/account/profile/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ theme_preference: selectedTheme })
      });
      const themeData = await themeRes.json();
      if (!themeRes.ok) throw new Error(themeData.error || 'Failed to update theme');
      if (onThemeChange) onThemeChange(selectedTheme);

      // Update language
      const langRes = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/account/profile/language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ language: selectedLang })
      });
      const langData = await langRes.json();
      if (!langRes.ok) throw new Error(langData.error || 'Failed to update language');
      localStorage.setItem('lang', selectedLang);
      if (onLangChange) onLangChange(selectedLang);

      setSnackbar({ open: true, message: t('settings_saved') || 'Settings saved successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || t('settings_save_error') || 'Error saving settings!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Topbar onLogout={onLogout} onSettings={onSettings} onMainPage={onMainPage} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 'auto', sm: 'calc(100vh - 64px)' },
          px: { xs: 1, sm: 2, md: 0 },
          py: { xs: 2, sm: 0 },
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            minWidth: { xs: '90%', sm: 320 },
            maxWidth: { xs: '90%', sm: 400, md: 480 },
            width: { xs: '90%', sm: 'auto' },
            bgcolor: theme.palette.background.paper,
            boxShadow: 2,
          }}
          elevation={2}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, fontSize: { xs: 22, sm: 26 } }}>{t('settings')}</Typography>
          <Typography variant="subtitle1" sx={{ mb: 2, fontSize: { xs: 16, sm: 18 } }}>{t('theme')}</Typography>
          <RadioGroup value={selectedTheme} onChange={handleThemeChangeLocal} row={false} sx={{ mb: 2 }}>
            <FormControlLabel value="dark" control={<Radio size="small" />} label={t('dark')} sx={{ mr: 2 }} />
            <FormControlLabel value="light" control={<Radio size="small" />} label={t('light')} sx={{ mr: 2 }} />
          </RadioGroup>
          <Divider sx={{ my: { xs: 2, sm: 3 } }} />
          <Typography variant="subtitle1" sx={{ mb: 2, fontSize: { xs: 16, sm: 18 } }}>{t('language')}</Typography>
          <RadioGroup value={selectedLang} onChange={handleLangChange} row={false} sx={{ mb: 2 }}>
            <FormControlLabel value="en" control={<Radio size="small" />} label={t('english')} sx={{ mr: 2 }} />
            <FormControlLabel value="tr" control={<Radio size="small" />} label={t('turkish')} sx={{ mr: 2 }} />
          </RadioGroup>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, fontSize: { xs: 15, sm: 16 }, py: { xs: 1, sm: 1.2 } }}
            onClick={handleSave}
            fullWidth
            disabled={loading}
          >
            {loading ? t('saving') : t('save')}
          </Button>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Paper>
      </Box>
    </Box>
  );
}
