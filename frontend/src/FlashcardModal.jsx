import React, { useContext, useEffect, useState } from 'react';
import { getFlashcards, createFlashcard, deleteFlashcard } from './services/flashcardServices';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  IconButton,
  Fab,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AddFlashcardModal from './AddFlashcardModal';
import { I18nContext } from './i18n';

export default function FlashcardModal({ open, onClose, deckTitle, deckId}) {
  const theme = useTheme();
  const {t} = useContext(I18nContext);
  

  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteFlashcard = async (flashcardId) => {
    try {
      await deleteFlashcard(flashcardId);
      setFlashcards(prev => prev.filter(f => f.id !== flashcardId));
    } catch (err) {
      console.error('Error deleting flashcard:', err);
    }
  };

  const handleAddFlashcard = async (front, back) => {
    setAddLoading(true);
    setError('');
    try {
      const res = await createFlashcard({ deckId, frontText: front, backText: back });
      if (res.data && res.data.flashcard) {
        setFlashcards(prev => [...prev, res.data.flashcard]);
        setAddModalOpen(false);
      } else {
        setError(res.data?.error || 'Failed to add flashcard');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setAddLoading(false);
    }
  };

  useEffect(() => {
    const fetchFlashcardsList = async () => {
      if (!open || !deckId) return;
      setLoading(true);
      try {
        const res = await getFlashcards(deckId);
        if (res.data && Array.isArray(res.data.flashcards)) {
          setFlashcards(res.data.flashcards);
        } else {
          setFlashcards([]);
        }
      } catch (err) {
        console.error('Error fetching flashcards:', err);
        setFlashcards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardsList();
  }, [deckId, open]);

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
          {deckTitle} - {t('flashcards') || 'Flashcards'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : flashcards.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 3 }}>
            {t('no_flashcards') || 'No flashcards found'}
          </Typography>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            maxHeight: '60vh',
            overflow: 'auto',
            pr: 1,
            mt: 1
          }}>
            {flashcards.map((flashcard) => (
              <Paper
                key={flashcard.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.border.main}`,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {flashcard.front_text}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {flashcard.back_text}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteFlashcard(flashcard.id)}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        color: theme.palette.error.dark,
                        bgcolor: 'rgba(217, 125, 85, 0.1)',
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setAddModalOpen(true)}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          boxShadow: 3
        }}
      >
        <AddIcon />
      </Fab>
      <AddFlashcardModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setError('');
        }}
        onSave={handleAddFlashcard}
        loading={addLoading}
        error={error}
      />
    </Dialog>
  );
}