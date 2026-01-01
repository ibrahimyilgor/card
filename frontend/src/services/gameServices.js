import api from './api';

// Get all flashcards for a deck
export const getGameFlashcards = deckId =>
  api.get(`/games/${deckId}`);

// Get only hard cards (cards with wrong_count > 0)
export const getHardFlashcards = deckId =>
  api.get(`/games/${deckId}/hard`);

// Get flashcards with multiple choice options
export const getFlashcardsWithOptions = deckId =>
  api.get(`/games/${deckId}/options`);

// Validate typed answer for write mode
export const validateAnswer = (flashcardId, userAnswer) =>
  api.post('/games/validate-answer', { flashcardId, userAnswer });

// Update flashcard statistics after answering
export const updateFlashcardStats = (flashcardId, isCorrect) =>
  api.post('/games/update-stats', { flashcardId, isCorrect });
