import { Box, Button, Divider, Paper, Typography, useTheme, Snackbar, Alert, Fade, Switch, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useContext, useState } from "react";
import Topbar from "./Topbar";
import { I18nContext } from "./i18n";
import SettingsIcon from '@mui/icons-material/Settings';
import TranslateIcon from '@mui/icons-material/Translate';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PaletteIcon from '@mui/icons-material/Palette';

export default function Settings({ currentTheme, onThemeChange, onLangChange, onLogout, onSettings, onMainPage }) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'dark');
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('lang') || 'en');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [savedAnim, setSavedAnim] = useState(false);

  const handleThemeChangeLocal = (e) => {
    setSelectedTheme(e.target.checked ? 'light' : 'dark');
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

      setSavedAnim(true);
      setSnackbar({ open: true, message: t('settings_saved') || 'Settings saved successfully!', severity: 'success' });
      setTimeout(() => setSavedAnim(false), 1200);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || t('settings_save_error') || 'Error saving settings!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.gradient ?? theme.palette.background.default, position: 'relative' }}>
      <Topbar onLogout={onLogout} onSettings={onSettings} onMainPage={onMainPage} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 'auto', sm: 'calc(100vh - 74px)' },
          px: { xs: 1, sm: 2, md: 0 },
          py: { xs: 2, sm: 0 },
        }}
      >
        <Fade in timeout={600}>
          <Paper
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 5,
              width: '90%',
              height: '95%',
              maxWidth: '95%',
              maxHeight: '95%',
        bgcolor: theme.palette.background.paper,
        // boxShadow: theme.shadows[4],
        border: `1.5px solid ${theme.palette.border.main}`,
              position: 'relative',
              overflow: 'hidden',
            }}
            elevation={4}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 3, width: '100%' }}>
              <SettingsIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: 22, sm: 26 }, color: theme.palette.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('settings')}</Typography>
            </Box>
        <Divider sx={{ mb: 3, borderColor: theme.palette.text.primary, opacity: 0.18 }} />
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
              {/* Theme Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 180 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                  <PaletteIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: 15, sm: 17 }, color: theme.palette.text.primary }}>{t('theme')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <DarkModeIcon sx={{ fontSize: 22, mr: 1, color: theme.palette.primary.main }} />
                  <Switch
                    checked={selectedTheme === 'light'}
                    onChange={handleThemeChangeLocal}
                    color="primary"
                    sx={{ mx: 1 }}
                    inputProps={{ 'aria-label': 'theme switch' }}
                  />
                  <LightModeIcon sx={{ fontSize: 22, ml: 1, color: theme.palette.primary.main }} />
                </Box>
              </Box>
              {/* Language Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 180 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                  <TranslateIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: 15, sm: 17 }, color: theme.palette.text.primary }}>{t('language')}</Typography>
                </Box>
                <FormControl fullWidth variant="standard" sx={{ mt: 2 }}>
                  <Select
                    labelId="lang-select-label"
                    value={selectedLang}
                    onChange={handleLangChange}
                    disableUnderline
                    sx={{
                      fontWeight: 600,
                      fontSize: 16,
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      borderRadius: 2,
                      pl: 2,
                      height: 48,
                      minHeight: 48,
                      display: 'flex',
                      alignItems: 'center',
                      // boxShadow: selectedTheme === 'light' ? '0 1px 4px 0 #2e4f8822' : undefined,
                    }}
                  >
                    <MenuItem value="en">{t('english')}</MenuItem>
                    <MenuItem value="tr">{t('turkish')}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
              <Divider sx={{ mb: 3, borderColor: theme.palette.text.primary, opacity: 0.18 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  mt: 2,
                  fontSize: { xs: 16, sm: 17 },
                  py: { xs: 1.2, sm: 1.4 },
                  fontWeight: 700,
                  borderRadius: 2,
                  // boxShadow: savedAnim ? '0 0 16px 2px #2e4f88aa' : '0 2px 8px #2e4f8822',
                  transition: 'box-shadow 0.3s',
                  animation: savedAnim ? 'pulse 1.2s' : undefined,
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 #2e4f88aa' },
                    '70%': { boxShadow: '0 0 16px 8px #2e4f88aa' },
                    '100%': { boxShadow: '0 0 0 0 #2e4f88aa' },
                  },
                  minWidth: 160,
                  maxWidth: 220,
                }}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? t('saving') : t('save')}
              </Button>
            </Box>
            
          </Paper>
        </Fade>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1400 }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
