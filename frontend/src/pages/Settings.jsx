import { Box, Grid, Button, Divider, Paper, Typography, useTheme, Snackbar, Alert, Switch, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useContext, useState } from "react";
import { I18nContext } from "../utils/i18n";
import { updateTheme, updateLanguage } from '../services/accountServices';
import TranslateIcon from '@mui/icons-material/Translate';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PaletteIcon from '@mui/icons-material/Palette';

export default function Settings({ currentTheme, onThemeChange, onLangChange }) {
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
    const accountId = localStorage.getItem('accountId');
    try {
      // Update theme
      const themeRes = await updateTheme(selectedTheme, accountId);
      if (themeRes.status !== 200) throw new Error(themeRes.data?.error || 'Failed to update theme');
      if (onThemeChange) onThemeChange(selectedTheme);

      // Update language
      const langRes = await updateLanguage(selectedLang, accountId);
      if (langRes.status !== 200) throw new Error(langRes.data?.error || 'Failed to update language');
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
    <Box sx={{ height: "98%", width: '95%', bgcolor: theme.palette.background.paper, p: 0, position: 'relative', mx: 'auto', display: 'flex', flexDirection: 'column', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>    
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
          <Box sx={{ mb: { xs: 3, sm: 4 }, width: '100%' }}>
            <Box sx={{ width: '100%' }}>
              <Grid container spacing={4} justifyContent="center" alignItems="center">
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', sm: '45%' }, display: 'flex', alignItems: 'stretch' }}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, width: '100%', height: '100%', minHeight: 150, display: 'flex', flexDirection: 'column'}}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 2 }}>
                      <PaletteIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: theme.palette.text.cardTitle, mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 17, md: 18 }, color: theme.palette.text.cardTitle }}>{t('theme')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <DarkModeIcon sx={{ fontSize: { xs: 20, sm: 22 }, mr: 1, color: theme.palette.text.cardTitle }} />
                      <Switch
                        checked={selectedTheme === 'light'}
                        onChange={handleThemeChangeLocal}
                        color="primary"
                        sx={{ mx: { xs: 0.5, sm: 1 } }}
                        inputProps={{ 'aria-label': 'theme switch' }}
                      />
                      <LightModeIcon sx={{ fontSize: { xs: 20, sm: 22 }, ml: 1, color: theme.palette.text.cardTitle }} />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: { xs: '100%', sm: '45%' }, display: 'flex', alignItems: 'stretch' }}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, width: '100%', height: '100%', minHeight: 150, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 2 }}>
                      <TranslateIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: theme.palette.text.cardTitle, mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 17, md: 18 }, color: theme.palette.text.cardTitle }}>{t('language')}</Typography>
                    </Box>
                    <FormControl fullWidth variant="standard" sx={{ mt: 1 }}>
                      <Select
                        labelId="lang-select-label"
                        value={selectedLang}
                        onChange={handleLangChange}
                        disableUnderline
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: 15, sm: 16 },
                          bgcolor: theme.palette.background.paper,
                          color: theme.palette.text.cardTitle,
                          borderRadius: { xs: 1.5, sm: 2 },
                          pl: { xs: 1.5, sm: 2 },
                          height: { xs: 44, sm: 48 },
                          minHeight: { xs: 44, sm: 48 },
                          display: 'flex',
                          alignItems: 'center',
                          '& .MuiSelect-icon': {
                            color: theme.palette.text.cardTitle,
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: theme.palette.background.paper,
                            }
                          }
                        }}
                      >
                        <MenuItem value="en" sx={{ color: theme.palette.text.cardTitle, bgcolor: theme.palette.background.paper }}>
                          {t('english')}
                        </MenuItem>
                        <MenuItem value="tr" sx={{ color: theme.palette.text.cardTitle, bgcolor: theme.palette.background.paper }}>
                          {t('turkish')}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Paper>
                </Grid>
              </Grid>
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
                mr: { xs: 2, sm: 3 },
                fontWeight: 700,
                borderRadius: 2,
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
