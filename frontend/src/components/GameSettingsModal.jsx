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
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          borderRadius: 2.5,
          boxShadow: theme.shadows[3],
          border: `1.5px solid ${theme.palette.border.main}`,
          overflow: 'hidden',
          px: { xs: 0, sm: 0 },
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.paper ?? theme.palette.primary.main,
          p: 3,
          '& .MuiTypography-root': {
            color: theme.palette.text.cardTitle,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 0.5,
          }
        }}
      >
        {t('game_settings') || 'Game Settings'}
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: theme.palette.background.paper,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          '& .MuiTextField-root': {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.border.main,
                transition: 'all 0.2s',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.text.cardTitle,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.text.cardTitle,
                borderWidth: '2px',
              },
              '& input': {
                color: theme.palette.text.cardTitle,
              }
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.cardTitle,
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.text.cardTitle,
            },
            '& .MuiInputLabel-root.MuiFormLabel-filled': {
              color: theme.palette.text.cardTitle,
            },
            '& .MuiInputLabel-root.MuiFormLabel-filled.Mui-focused': {
              color: theme.palette.text.cardTitle,
            }
          },
          '& .MuiSelect-root': {
            color: theme.palette.text.cardTitle,
          },
          '& .MuiOutlinedInput-root.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.text.cardTitle,
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.difficulty_enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  difficulty_enabled: e.target.checked
                }))}
                sx={{
                  p: 0.5,
                  color: theme.palette.text.cardTitle,
                  '&.Mui-checked': {
                    color: theme.palette.text.cardTitle,
                  }
                }}
              />
            }
            label={t('enable_difficulty') || 'Enable Difficulty'}
            sx={{ ml: 0.5, fontWeight: 525, color: theme.palette.text.cardTitle, mt: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel
              id="mode-select-label"
              sx={{
                color: theme.palette.text.cardTitle,
                fontWeight: 525,
                '&.Mui-focused': {
                  color: theme.palette.text.cardTitle,
                },
                '&.MuiFormLabel-filled': {
                  color: theme.palette.text.cardTitle,
                },
                '&.MuiFormLabel-filled.Mui-focused': {
                  color: theme.palette.text.cardTitle,
                }
              }}
              shrink={true}
              className="select-label"
            >
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
              sx={{ fontWeight: 500, fontSize: 15, color: theme.palette.text.cardTitle,
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.text.cardTitle,
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: theme.palette.background.paper,
                    '& .MuiMenuItem-root': {
                      color: theme.palette.text.cardTitle,
                    },
                    '& .MuiMenuItem-root.Mui-selected': {
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.cardTitle,
                    },
                    '& .MuiMenuItem-root.Mui-selected:hover': {
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.cardTitle,
                    }
                  }
                }
              }}
            >
              <MenuItem value="standard">{t('mode_standard') || 'Standard'}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          bgcolor: theme.palette.background.paper,
          p: 3,
          pt: 2,
          gap: 1.5,
          borderTop: `1px solid ${theme.palette.border.main}`,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main,
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 2,
            minWidth: 100,
            px: 2,
            py: 1,
            boxShadow: 'none',
            '&:hover': {
              borderColor: theme.palette.error.dark,
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
            },
          }}
          variant="outlined"
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSaveAndStart}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 2,
            minWidth: 100,
            px: 2,
            py: 1,
            boxShadow: loading ? 'none' : theme.shadows[1],
            letterSpacing: 0.5,
            '&:hover': {
              bgcolor: theme.palette.success.dark,
            },
          }}
        >
          {loading ? t('starting') || 'Starting...' : t('start_game') || 'Start Game'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}