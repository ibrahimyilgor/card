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
import { I18nContext } from '../../utils/i18n';

export default function AddFlashcardModal({ open, onClose, onSave, loading, error, editFlashcard }) {
  const theme = useTheme();
  const {t} = useContext(I18nContext);

  const [front, setFront] = useState(editFlashcard ? editFlashcard.front_text : '');
  const [back, setBack] = useState(editFlashcard ? editFlashcard.back_text : '');

  React.useEffect(() => {
    if (editFlashcard) {
      setFront(editFlashcard.front_text);
      setBack(editFlashcard.back_text);
    } else {
      setFront('');
      setBack('');
    }
  }, [editFlashcard, open]);

  const handleSubmit = () => {
    onSave(front, back);
    if (!editFlashcard) {
      setFront('');
      setBack('');
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          '& .MuiTypography-root': {
            color: theme.palette.text.cardTitle,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 0.5,
          }
        }}
      >
          {editFlashcard ? (t('update_flashcard') || 'Kartı Güncelle') : (t('add_flashcard') || 'Kart Ekle')}
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
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            label={t('front_side') || 'Front Side'}
            fullWidth
            value={front}
            onChange={(e) => setFront(e.target.value)}
            variant="outlined"
            error={!!error}
            sx={{ mt: 2, fontWeight: 600, fontSize: 16, borderRadius: 2, bgcolor: theme.palette.background.paper }}
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
          />
          <TextField
            label={t('back_side') || 'Back Side'}
            fullWidth
            value={back}
            onChange={(e) => setBack(e.target.value)}
            variant="outlined"
            error={!!error}
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
          />
          {error && (
            <Typography color={theme.palette.error.main} variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
              {error}
            </Typography>
          )}
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
          variant="outlined"
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
        >
          {t('cancel') || 'İptal'}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !front.trim() || !back.trim()}
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
          {loading
            ? (t('saving') || 'Saving...')
            : editFlashcard
              ? (t('update') || 'Güncelle')
              : (t('add') || 'Ekle')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}