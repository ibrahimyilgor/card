
import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, useTheme, Fab, CircularProgress, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StyleIcon from '@mui/icons-material/Style';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Topbar from './Topbar';
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
        const token = localStorage.getItem('token');
        const res = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/decks/' + deck.id, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        
        if (res.ok) {
          // Remove deck from local state
          setDecks(prevDecks => prevDecks.filter(d => d.id !== deck.id));
        } else {
          alert(t('delete_deck_error') || 'Error deleting deck');
        }
      } catch (err) {
        alert(t('network_error') || 'Network error');
      }
  };

  useEffect(() => {
    const fetchDecks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log("ibrahim", accountId, token)
        if (!accountId) {
          setDecks([]);
          setLoading(false);
          return;
        }
        const res = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/decks/' + accountId, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.decks)) {
          setDecks(data.decks);
        } else {
          setDecks([]);
        }
      } catch {
        setDecks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, [accountId]);

  return (
    <Box sx={{ minHeight: '100%', width: '100%', bgcolor: theme.palette.background.default, p: 0, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100% - 74px)', height: "80vh", overflow: "auto" }}>
        {loading ? (
          <CircularProgress color="primary" />
        ) : decks && decks.length === 0 ? (
          <Typography variant="h6" color="text.primary" sx={{ textAlign: 'center' }}>
            {t('create_first_deck') || 'İlk destenizi oluşturun'}
          </Typography>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', px: 2, scrollbarWidth: 'thin', '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.action.hover, borderRadius: 4}, height: "100%", marginTop: "10px", marginBottom: "10px" }}>
            {decks && decks.map(deck => (
              <Paper key={deck.id} sx={{ p: 3, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
                <Box sx={{ flex: 1, mr: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{deck.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{deck.description}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    color="primary" 
                    onClick={() => { setEditDeck(deck); setModalOpen(true); }}
                    sx={{
                      '&:hover': {
                        color: theme.palette.primary.main,
                        bgcolor: 'rgba(111, 164, 175, 0.1)',
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="primary"
                    onClick={() => { 
                      setSelectedDeck(deck);
                      setFlashcardModalOpen(true);
                    }}
                    sx={{
                      '&:hover': {
                        color: theme.palette.primary.main,
                        bgcolor: 'rgba(111, 164, 175, 0.1)',
                      }
                    }}
                  >
                    <StyleIcon />
                  </IconButton>
                  <IconButton 
                    color="primary"
                    onClick={() => {
                      setSelectedDeckForGame(deck.id);
                      setGameSettingsModalOpen(true);
                    }}
                    sx={{
                      '&:hover': {
                        color: theme.palette.success.main,
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                      }
                    }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton 
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        color: theme.palette.error.dark,
                        bgcolor: 'rgba(217, 125, 85, 0.1)',
                      }
                    }}
                    onClick={() => handleDeleteDeck(deck)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
      <Fab
        color="primary"
        variant="extended"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, boxShadow: 3, fontWeight: 600 }}
        onClick={() => {
          setEditDeck(null);
          setModalOpen(true);
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        {t('new_deck') || 'Yeni Deste'}
      </Fab>
      <DeckModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalError(''); }}
        editDeck={editDeck}
        onSave={async (title, desc, settings) => {
          setModalLoading(true);
          setModalError('');
            try {
   
            const token = localStorage.getItem('token');
            let url = window.location.protocol + '//' + window.location.hostname + ':5000/decks';
            let method = 'POST';
            let body = { 
              accountId, 
              title, 
              description: desc,
              difficulty_enabled: settings.difficulty_enabled,
              mode: settings.mode 
            };
            if (editDeck) {
              url += '/' + editDeck.id;
              method = 'PUT';
              body = { 
                title, 
                description: desc,
                difficulty_enabled: settings.difficulty_enabled,
                mode: settings.mode 
              };
            }
            else {
              url += "/create"
            }
            const res = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
              },
              body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
              setModalOpen(false);
              setModalError('');
              // Refresh decks
              setLoading(true);
              const decksRes = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/decks/' + accountId, {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              const decksData = await decksRes.json();
              setDecks(decksData.decks || []);
            } else {
              setModalError(data.error || 'Error saving deck');
            }
          } catch (err) {
            setModalError('Network error');
          } finally {
            setModalLoading(false);
            setLoading(false)
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
