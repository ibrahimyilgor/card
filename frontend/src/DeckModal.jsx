import { useState, useEffect, useContext } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  useTheme,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { I18nContext } from './i18n';

export default function DeckModal({ 
  open, 
  onClose, 
  onSave, 
  initialTitle = '', 
  initialDesc = '', 
  loading = false, 
  error = '',
  editDeck = null 
}) {
  const theme = useTheme();
  const {t} = useContext(I18nContext);
  
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);
  const [difficultyEnabled, setDifficultyEnabled] = useState(editDeck?.difficulty_enabled || false);
  const [mode, setMode] = useState(editDeck?.mode || 'standard');

  useEffect(() => {
    setTitle(initialTitle);
    setDesc(initialDesc);
    setDifficultyEnabled(editDeck?.difficulty_enabled || false);
    setMode(editDeck?.mode || 'standard');
  }, [initialTitle, initialDesc, editDeck, open]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, desc, { difficulty_enabled: difficultyEnabled, mode });
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
          // borderBottom: `1px solid ${theme.palette.border.main}`,
          '& .MuiTypography-root': {
            color: theme.palette.text.cardTitle,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 0.5,
          }
        }}
      >
        {editDeck ? t('edit_deck') : t('new_deck')}
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
        <TextField
          label={t('deck_title')}
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          sx={{ mt: 3, mb: 2, fontWeight: 600, fontSize: 18, borderRadius: 2, bgcolor: theme.palette.background.paper }}
          InputLabelProps={{
            sx: {
              color: theme.palette.text.cardTitle,
              fontWeight: 525,
              fontSize: 15,
            }
          }}
          inputProps={{
            style: {
              color: theme.palette.text.cardTitle,
            }
          }}
          variant="outlined"
        />
        <TextField
          label={t('deck_description')}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          sx={{ fontSize: 15, borderRadius: 2, bgcolor: theme.palette.background.paper }}
          InputLabelProps={{
            sx: {
              color: theme.palette.text.cardTitle,
              fontWeight: 525,
              fontSize: 15,
            }
          }}
          inputProps={{
            style: {
              color: theme.palette.text.cardTitle,
            }
          }}
          variant="outlined"
        />
        {!editDeck && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={difficultyEnabled}
                  onChange={(e) => setDifficultyEnabled(e.target.checked)}
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
              sx={{ ml: 0.5, fontWeight: 525, color: theme.palette.text.cardTitle }}
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
                value={mode}
                label={t('game_mode') || 'Game Mode'}
                onChange={(e) => setMode(e.target.value)}
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
        )}
        {error && (
          <Box sx={{
            color: theme.palette.error.main,
            mt: 2,
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: `${theme.palette.error.main}15`,
            fontSize: '0.95rem',
            fontWeight: 500,
          }}>
            {error}
          </Box>
        )}
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
          onClick={handleSave}
          variant="contained"
          disabled={loading || !title.trim()}
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
          {loading ? t('saving') || 'Kaydediliyor...' : editDeck ? t('edit') || 'Düzenle' : t('add') || 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
