import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, useTheme } from '@mui/material';

export default function DeckModal({ open, onClose, onSave, initialTitle = '', initialDesc = '', loading = false, error = '', t }) {
  const theme = useTheme();
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);

  useEffect(() => {
    setTitle(initialTitle);
    setDesc(initialDesc);
  }, [initialTitle, initialDesc, open]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, desc);
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
          color: theme.palette.text.primary,
          p: 3,
          fontWeight: 600,
          fontSize: 24,
          borderBottom: `1px solid ${theme.palette.border.main}`
        }}
      >
        {t('new_deck')}
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
