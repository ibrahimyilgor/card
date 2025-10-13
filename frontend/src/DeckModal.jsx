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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>{t('new_deck') }</DialogTitle>
      <DialogContent sx={{ bgcolor: theme.palette.background.paper }}>
        <TextField
          label={t('deck_title') }
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ sx: { color: theme.palette.text.primary } }}
        />
        <TextField
          label={t('deck_description') }
          value={desc}
          onChange={e => setDesc(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          InputLabelProps={{ sx: { color: theme.palette.text.primary } }}
        />
        {error && <div style={{ color: theme.palette.error.main, marginTop: 8 }}>{error}</div>}
      </DialogContent>
      <DialogActions sx={{ bgcolor: theme.palette.background.paper }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          {t('cancel') }
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={loading || !title.trim()}>
          {loading ? t('saving') || 'Kaydediliyor...' : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
