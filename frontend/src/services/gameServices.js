import api from './api';

export const getGameFlashcards = deckId =>
  api.get(`/games/${deckId}`);
