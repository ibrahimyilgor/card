
import  { useEffect, useState, useContext } from 'react';
import { getDecks, createDeck, updateDeck, deleteDeck } from './services/deckServices';
import { Box, Typography, useTheme, Fab, CircularProgress, Paper, IconButton, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StyleIcon from '@mui/icons-material/Style';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { I18nContext } from './i18n';
import DeckModal from './DeckModal';
import FlashcardModal from './FlashcardModal';
import GameSettingsModal from './components/GameSettingsModal';

export default function Info({ accountId, onStartGame }) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  const [decks, setDecks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editDeck, setEditDeck] = useState(null);
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [gameSettingsModalOpen, setGameSettingsModalOpen] = useState(false);
  const [selectedDeckForGame, setSelectedDeckForGame] = useState(null);

  const handleDeleteDeck = async (deck) => {
    try {
      await deleteDeck(deck.id);
      setDecks(prevDecks => prevDecks.filter(d => d.id !== deck.id));
    } catch (err) {
      alert(t('delete_deck_error') || 'Error deleting deck');
    }
  };

  useEffect(() => {
    const fetchDecksList = async () => {
      setLoading(true);
      try {
        if (!accountId) {
          setDecks([]);
          setLoading(false);
          return;
        }
        const res = await getDecks(accountId);
        if (Array.isArray(res.data.decks)) {
          setDecks(res.data.decks);
        } else {
          setDecks([]);
        }
      } catch {
        setDecks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDecksList();
  }, [accountId]);

  return (
  <Box sx={{ height: "98%", width: '95%', bgcolor: theme.palette.background.paper, p: 0, position: 'relative', mx: 'auto', display: 'flex', flexDirection: 'column', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
    <Box sx={{ height: "92%",flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', py: 4, backgroundColor: theme.palette.background.paper }}>
        {loading ? (
          <CircularProgress color="primary" />
        ) : decks && decks.length === 0 ? (
          <Typography variant="h6" color="text.primary" sx={{ textAlign: 'center' }}>
            {t('create_first_deck') || 'İlk destenizi oluşturun'}
          </Typography>
        ) : (
          <Box sx={{ height: "95%", width: '95%', mx: 'auto', scrollbarWidth: 'thin', '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.action.hover, borderRadius: 4}, minHeight: 200, marginTop: "10px", marginBottom: "10px" }}>
            {decks && decks.map(deck => (
              <Paper key={deck.id} sx={{ p: 3, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0, mr: 3 }}>
                  <Tooltip title={deck.title} arrow>
                    <Typography
                      variant="subtitle1"
                      color="text.cardTitle"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        display: 'block',
                      }}
                    >
                      {deck.title}
                    </Typography>
                  </Tooltip>
                  <Tooltip title={deck.description || ''} arrow>
                    <Typography
                      variant="body2"
                      color="text.cardSubtitle"
                      sx={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        display: 'block',
                      }}
                    >
                      {deck.description}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                  <Tooltip title={t('edit_deck') || 'Düzenle'} arrow>
                    <IconButton
                      onClick={() => { setEditDeck(deck); setModalOpen(true); }}
                      sx={{
                        color: '#fbbf24', // yellow
                        transition: 'transform 0.15s',
                        '&:hover': {
                          color: '#f59e0b', // darker yellow
                          bgcolor: 'rgba(251,191,36,0.08)',
                          transform: 'scale(1.15)',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('manage_flashcards') || 'Kartlar'} arrow>
                    <IconButton
                      onClick={() => { setSelectedDeck(deck); setFlashcardModalOpen(true); }}
                      sx={{
                        color: '#2563eb', // blue
                        transition: 'transform 0.15s',
                        '&:hover': {
                          color: '#1d4ed8', // darker blue
                          bgcolor: 'rgba(37,99,235,0.08)',
                          transform: 'scale(1.15)',
                        },
                      }}
                    >
                      <StyleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('play_deck') || 'Oyna'} arrow>
                    <IconButton
                      onClick={() => { setSelectedDeckForGame(deck.id); setGameSettingsModalOpen(true); }}
                      sx={{
                        color: '#22c55e', // green
                        transition: 'transform 0.15s',
                        '&:hover': {
                          color: '#16a34a', // darker green
                          bgcolor: 'rgba(34,197,94,0.08)',
                          transform: 'scale(1.15)',
                        },
                      }}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('delete_deck') || 'Sil'} arrow>
                    <IconButton
                      sx={{
                        color: theme.palette.error.main,
                        transition: 'transform 0.15s',
                        '&:hover': {
                          color: theme.palette.error.dark,
                          bgcolor: 'rgba(217, 125, 85, 0.08)',
                          transform: 'scale(1.15)',
                        },
                      }}
                      onClick={() => handleDeleteDeck(deck)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))}
            {/* Button moved outside scrollable area */}
          </Box>
        )}
      </Box>
      <Box sx={{ 
            alignItems: 'center', height: "8%", width: '100%', display: 'flex', justifyContent: 'center', bgcolor: 'transparent' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
           
            width: '50%',
            height: "80%",
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: 700,
            fontSize: '1.1rem',
            borderRadius: 3,
            boxShadow: theme.palette.action.shadow,
            py: 1.5,
            px: 0,
            letterSpacing: 1,
            textTransform: 'none',
            transition: 'background 0.2s',
            '&:hover': {
              bgcolor: theme.palette.action.newDeckHover,
            },
          }}
          onClick={() => {
            setEditDeck(null);
            setModalOpen(true);
          }}
        >
          {t('new_deck') || 'Yeni Deste'}
        </Button>
      </Box>
      <DeckModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalError(''); }}
        editDeck={editDeck}
        onSave={async (title, desc, settings) => {
          setModalLoading(true);
          setModalError('');
          try {
            let res;
            if (editDeck) {
              res = await updateDeck(editDeck.id, {
                title,
                description: desc,
                difficulty_enabled: settings.difficulty_enabled,
                mode: settings.mode
              });
            } else {
              res = await createDeck({
                accountId,
                title,
                description: desc,
                difficulty_enabled: settings.difficulty_enabled,
                mode: settings.mode
              });
            }
            if (res.status === 200 || res.status === 201) {
              setModalOpen(false);
              setModalError('');
              setLoading(true);
              // Refresh decks
              const decksRes = await getDecks(accountId);
              setDecks(decksRes.data.decks || []);
            } else {
              setModalError('Error saving deck');
            }
          } catch (err) {
            setModalError('Network error');
          } finally {
            setModalLoading(false);
            setLoading(false);
          }
        }}
        initialTitle={editDeck ? editDeck.title : ''}
        initialDesc={editDeck ? editDeck.description : ''}
        loading={modalLoading}
        error={modalError}
      />
      <FlashcardModal
        open={flashcardModalOpen}
        onClose={() => {
          setFlashcardModalOpen(false);
          setSelectedDeck(null);
        }}
        deckId={selectedDeck?.id}
        deckTitle={selectedDeck?.title}
      />
      <GameSettingsModal
        open={gameSettingsModalOpen}
        onClose={() => {
          setGameSettingsModalOpen(false);
          setSelectedDeckForGame(null);
        }}
        onStart={(settings) => {
          setGameSettingsModalOpen(false);
          onStartGame(selectedDeckForGame);
        }}
        deckId={selectedDeckForGame}
      />
    </Box>
  );
}
