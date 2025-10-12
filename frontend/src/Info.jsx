
import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, useTheme, Fab, CircularProgress, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Topbar from './Topbar';
import { I18nContext } from './i18n';
import DeckModal from './DeckModal';

export default function Info({ onLogout, onSettings, userId }) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  const [decks, setDecks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editDeck, setEditDeck] = useState(null);

  useEffect(() => {
    const fetchDecks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log("ibrahim", userId, token)
        if (!userId) {
          setDecks([]);
          setLoading(false);
          return;
        }
        const res = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/decks/' + userId, {
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
  }, [userId]);

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: theme.palette.background.default, p: 0, position: 'relative' }}>
      <Topbar onLogout={onLogout} onSettings={onSettings} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', height: "90vh", overflow: "auto" }}>
        {loading ? (
          <CircularProgress color="primary" />
        ) : decks && decks.length === 0 ? (
          <Typography variant="h6" color="text.primary" sx={{ textAlign: 'center' }}>
            {t('create_first_deck') || 'İlk destenizi oluşturun'}
          </Typography>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', px: 2,  scrollbarWidth: 'thin', '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.action.hover, borderRadius: 4}, height: "100%", marginTop: "10px", marginBottom: "10px" }}>
            {decks && decks.map(deck => (
              <Paper key={deck.id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{deck.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{deck.description}</Typography>
                </Box>
                <IconButton color="primary" onClick={() => { setEditDeck(deck); setModalOpen(true); }}>
                  <EditIcon />
                </IconButton>
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
        onSave={async (title, desc) => {
          setModalLoading(true);
          setModalError('');
          try {
            const token = localStorage.getItem('token');
            let url = window.location.protocol + '//' + window.location.hostname + ':5000/decks';
            let method = 'POST';
            let body = { userId, title, description: desc };
            if (editDeck) {
              url += '/' + editDeck.id;
              method = 'PUT';
              body = { title, description: desc };
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
              const decksRes = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/decks/' + userId, {
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
        t={t}
      />
    </Box>
  );
}
