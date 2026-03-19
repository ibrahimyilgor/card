import api from './api';

export const getFlashcards = deckId =>
  api.get(`/decks/flashcards/${deckId}`);

export const createFlashcard = ({ deckId, frontText, backText }) =>
  api.post('/flashcards/create', { deckId, frontText, backText });

export const deleteFlashcard = flashcardId =>
  api.delete(`/flashcards/${flashcardId}`);
  
export async function updateFlashcard(flashcardId, data) {
  // expects { frontText?, backText?, enabled? }
  return await api.put(`/flashcards/${flashcardId}`, data);
}
