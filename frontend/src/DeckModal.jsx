import React, { useState, useEffect, useContext } from 'react';
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
          borderRadius: 3,
          boxShadow: theme.shadows[4],
          border: `1.5px solid ${theme.palette.border.main}`,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: theme.palette.background.paper, 
          p: 3,
          borderBottom: `1px solid ${theme.palette.border.main}`,
          '& .MuiTypography-root': {
            color: theme.palette.text.primary,
            fontWeight: 600,
            fontSize: 24,
          }
        }}
      >
        {editDeck ? t('edit_deck') : t('new_deck')}
      </DialogTitle>
      <DialogContent 
        sx={{ 
          bgcolor: theme.palette.background.paper,
          p: 3,
          '& .MuiTextField-root': {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.border.main,
                transition: 'all 0.2s',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: theme.palette.primary.main,
            }
          }
        }}
      >
        <TextField
          label={t('deck_title')}
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          InputLabelProps={{ 
            sx: { 
              color: theme.palette.text.secondary,
              fontWeight: 500
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
          InputLabelProps={{ 
            sx: { 
              color: theme.palette.text.secondary,
              fontWeight: 500
            } 
          }}
          variant="outlined"
        />
        {!editDeck && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={difficultyEnabled}
                  onChange={(e) => setDifficultyEnabled(e.target.checked)}
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
                value={mode}
                label={t('game_mode') || 'Game Mode'}
                onChange={(e) => setMode(e.target.value)}
              >
                <MenuItem value="standard">{t('mode_standard') || 'Standard'}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
        {error && (
          <div style={{ 
            color: theme.palette.error.main, 
            marginTop: 16,
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: `${theme.palette.error.main}15`,
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}
      </DialogContent>
      <DialogActions 
        sx={{ 
          bgcolor: theme.palette.background.paper,
          p: 3,
          pt: 2,
          gap: 1,
          borderTop: `1px solid ${theme.palette.border.main}`
        }}
      >
        <Button 
          onClick={onClose} 
          sx={{
            color: theme.palette.text.primary,
            borderColor: theme.palette.border.main,
            '&:hover': {
              borderColor: theme.palette.text.primary,
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            },
            minWidth: 100
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
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: 600,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            minWidth: 100,
            boxShadow: loading ? 'none' : theme.shadows[2]
          }}
        >
          {loading ? t('saving') || 'Kaydediliyor...' : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
