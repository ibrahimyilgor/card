import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, CircularProgress, Button, useTheme } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FlashCard from './components/FlashCard';
import GameSummary from './components/GameSummary';
import { I18nContext } from './i18n';

export default function Game({ deckId }) {
  const theme = useTheme();
  const { t } = useContext(I18nContext);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [scores, setScores] = useState({ correct: 0, incorrect: 0 });
  const [gameEnded, setGameEnded] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [deckId]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(window.location.protocol + '//' + window.location.hostname + ':5000/decks/flashcards/' + deckId, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.flashcards)) {
        // Shuffle the flashcards
        const shuffled = [...data.flashcards].sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
        console.log("ibrahimflashcards", shuffled)
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

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScores(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScores(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsCardFlipped(false); // Reset flip state for next card
    } else {
      setGameEnded(true);
    }
  };

  const handleCardFlip = () => {
    setIsCardFlipped(!isCardFlipped);
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setScores({ correct: 0, incorrect: 0 });
    setGameEnded(false);
    setIsCardFlipped(false);
    fetchFlashcards(); // Re-fetch and shuffle cards
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100%',
        bgcolor: theme.palette.background.default 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100%',
        bgcolor: theme.palette.background.default
      }}>
        <Typography variant="h6" color="text.secondary">
          {t('no_flashcards') || 'No flashcards found in this deck'}
        </Typography>
      </Box>
    );
  }

  if (gameEnded) {
    return (
      <Box sx={{ 
        minHeight: '100%',
        width: '100%',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <GameSummary
          correctCount={scores.correct}
          incorrectCount={scores.incorrect}
          onRestart={handleRestart}
          t={t}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100%',
      width: '100%',
      bgcolor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
   
      gap: 4
    }}>
      {/* Progress indicator */}
      <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
        {currentCardIndex + 1} / {flashcards.length}
      </Typography>

      {/* Card */}
      <FlashCard
        front={flashcards[currentCardIndex].front_text}
        back={flashcards[currentCardIndex].back_text}
        isFlipped={isCardFlipped}
        onFlip={handleCardFlip}
      />

      {/* Answer buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<CloseIcon />}
          onClick={() => handleAnswer(false)}
          sx={{ 
            borderRadius: 2,
            py: 1,
            px: 3,
            fontWeight: 600
          }}
        >
          {t('incorrect') || 'Incorrect'}
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckIcon />}
          onClick={() => handleAnswer(true)}
          sx={{ 
            borderRadius: 2,
            py: 1,
            px: 3,
            fontWeight: 600
          }}
        >
          {t('correct') || 'Correct'}
        </Button>
      </Box>
    </Box>
  );
}