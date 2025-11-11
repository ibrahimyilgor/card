import React, { useState, useContext, useEffect } from 'react';
import { getDeckSettings, updateDeckSettings } from '../services/deckServices';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { I18nContext } from '../i18n';

export default function GameSettingsModal({ open, onClose, onStart, deckId, initialSettings = null }) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  
  const [settings, setSettings] = useState({
    difficulty_enabled: false,
    mode: 'standard'
  });
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    const fetchSettings = async () => {
      if (!deckId || !open) return;
      try {
        const res = await getDeckSettings(deckId);
        if (res.data && res.data.settings) {
          setSettings({
            difficulty_enabled: res.data.settings.difficulty_enabled,
            mode: res.data.settings.mode || 'standard'
          });
        }
      } catch (err) {
        console.error('Error fetching deck settings:', err);
      }
    };
    fetchSettings();
  }, [deckId, open]);

  const handleSaveAndStart = async () => {
    setLoading(true);
    try {
      await updateDeckSettings(deckId, settings);
      onStart(settings);
    } catch (err) {
      console.error('Error saving deck settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1.5px solid ${theme.palette.border.main}`,
        }
      }}
    >
      <DialogTitle sx={{
        p: 3,
        borderBottom: `1px solid ${theme.palette.border.main}`,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('game_settings') || 'Game Settings'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.difficulty_enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  difficulty_enabled: e.target.checked
                }))}
                color="primary"
              />
            }
            label={t('enable_difficulty') || 'Enable Difficulty'}
          />
          <FormControl fullWidth>
            <InputLabel id="mode-select-label">
              {t('game_mode') || 'Game Mode'}
            </InputLabel>
            <Select
              labelId="mode-select-label"
              value={settings.mode}
              label={t('game_mode') || 'Game Mode'}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                mode: e.target.value
              }))}
            >
              <MenuItem value="standard">{t('mode_standard') || 'Standard'}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: theme.palette.text.primary,
            borderColor: theme.palette.border.main,
            '&:hover': {
              borderColor: theme.palette.text.primary,
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSaveAndStart}
          variant="contained"
          disabled={loading}
          sx={{
            fontWeight: 600
          }}
        >
          {loading ? t('starting') || 'Starting...' : t('start_game') || 'Start Game'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}