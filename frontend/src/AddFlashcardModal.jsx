import React, { useContext, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { I18nContext } from './i18n';

export default function AddFlashcardModal({ open, onClose, onSave, loading, error }) {
  const theme = useTheme();
  const {t} = useContext(I18nContext);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = () => {
    onSave(front, back);
    setFront('');
    setBack('');
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.border.main}`,
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('add_flashcard') || 'Add Flashcard'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            autoFocus
            label={t('front_side') || 'Front Side'}
            fullWidth
            value={front}
            onChange={(e) => setFront(e.target.value)}
            variant="outlined"
            error={!!error}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <TextField
            label={t('back_side') || 'Back Side'}
            fullWidth
            value={back}
            onChange={(e) => setBack(e.target.value)}
            variant="outlined"
            error={!!error}
            multiline
            rows={3}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !front.trim() || !back.trim()}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            fontWeight: 600
          }}
        >
          {loading ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}