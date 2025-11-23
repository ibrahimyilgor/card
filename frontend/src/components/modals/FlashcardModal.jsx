import React, { useContext, useEffect, useState } from 'react';
import { getFlashcards, createFlashcard, deleteFlashcard } from '../../services/flashcardServices';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  IconButton,
  Button,
  Tooltip,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddFlashcardModal from './AddFlashcardModal';
import { I18nContext } from '../../utils/i18n';
import { updateFlashcard } from '../../services/flashcardServices';

export default function FlashcardModal({ open, onClose, deckTitle, deckId}) {
  const theme = useTheme();
  const {t} = useContext(I18nContext);

  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState('');
  const [editFlashcard, setEditFlashcard] = useState(null);

  const handleDeleteFlashcard = async (flashcardId) => {
    try {
      await deleteFlashcard(flashcardId);
      setFlashcards(prev => prev.filter(f => f.id !== flashcardId));
    } catch (err) {
      console.error('Error deleting flashcard:', err);
    }
  };

  const handleAddOrUpdateFlashcard = async (front, back) => {
    setAddLoading(true);
    setError('');
    if (editFlashcard) {
      // Update
      try {
        const res = await updateFlashcard(editFlashcard.id, { frontText: front, backText: back });
        if (res.data && res.data.flashcard) {
          setFlashcards(prev => prev.map(f => f.id === editFlashcard.id ? { ...f, front_text: front, back_text: back } : f));
          setAddModalOpen(false);
          setEditFlashcard(null);
        } else {
          setError(res.data?.error || 'Failed to update flashcard');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setAddLoading(false);
      }
    } else {
      // Add
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
          bgcolor: theme.palette.background.paper,
          borderRadius: 2.5,
          boxShadow: theme.shadows[3],
          border: `1.5px solid ${theme.palette.border.main}`,
          overflow: 'hidden',
          px: { xs: 0, sm: 0 },
          minWidth: { xs: 340, sm: 480 },
          maxWidth: { xs: 400, sm: 600 },
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.paper ?? theme.palette.primary.main,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.border.main}`,
          '& .MuiTypography-root': {
            color: theme.palette.text.cardTitle,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 0.5,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            maxWidth: { xs: '180px', sm: '300px' },
            display: 'block',
          }
        }}
      >
          {t('flashcards') || 'Flashcards'}
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: theme.palette.background.paper,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          minHeight: 180,
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : flashcards.length === 0 ? (
            <Typography sx={{ textAlign: 'center', fontSize: 18, fontWeight: 500, color: theme.palette.text.cardTitle }}>
              {t('no_flashcards') || 'No flashcards found'}
            </Typography>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: '60vh',
            overflowY: 'auto',
            overflowX: 'hidden',
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
                    <Tooltip title={flashcard.front_text} arrow>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: theme.palette.text.cardTitle,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          maxWidth: { xs: '160px', sm: '220px' },
                          display: 'block',
                          wordBreak: 'break-all',
                        }}
                      >
                        {flashcard.front_text}
                      </Typography>
                    </Tooltip>
                    <Tooltip title={flashcard.back_text} arrow>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.cardSubtitle,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          maxWidth: { xs: '160px', sm: '220px' },
                          display: 'block',
                          wordBreak: 'break-all',
                        }}
                      >
                        {flashcard.back_text}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={t('edit') || 'Düzenle'} arrow>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditFlashcard(flashcard);
                          setAddModalOpen(true);
                        }}
                        sx={{
                          color: '#fbbf24',
                          transition: 'transform 0.15s',
                          '&:hover': {
                            color: '#f59e0b',
                            bgcolor: 'rgba(251,191,36,0.08)',
                            transform: 'scale(1.15)',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete') || 'Sil'} arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteFlashcard(flashcard.id)}
                        sx={{
                          color: theme.palette.error.main,
                          transition: 'transform 0.15s',
                          '&:hover': {
                            color: theme.palette.error.dark,
                            bgcolor: 'rgba(217, 125, 85, 0.1)',
                            transform: 'scale(1.15)',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>
      <Box sx={{ bgcolor: theme.palette.background.paper, p: 3, pt: 2, gap: 1.5, borderTop: `1px solid ${theme.palette.border.main}`, display: 'flex', justifyContent: 'flex-end' }}>
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
          {t('close') || 'Close'}
        </Button>
        <Button
          onClick={() => setAddModalOpen(true)}
          variant="contained"
          sx={{
            bgcolor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 2,
            minWidth: 100,
            px: 2,
            py: 1,
            boxShadow: theme.shadows[1],
            letterSpacing: 0.5,
            '&:hover': {
              bgcolor: theme.palette.success.dark,
            },
          }}
        >
          {t('add_flashcard') || 'Kart Ekle'}
        </Button>
      </Box>
      <AddFlashcardModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setError('');
          setEditFlashcard(null);
        }}
        onSave={handleAddOrUpdateFlashcard}
        loading={addLoading}
        error={error}
        editFlashcard={editFlashcard}
      />
    </Dialog>
  );
}