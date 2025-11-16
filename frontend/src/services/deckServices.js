import api from './api';

export const getDecks = accountId => api.get(`/decks/${accountId}`);
export const createDeck = deckData => api.post('/decks/create', deckData);
export const updateDeck = (deckId, deckData) => api.put(`/decks/${deckId}`, deckData);
export const deleteDeck = deckId => api.delete(`/decks/${deckId}`);

export const getDeckSettings = deckId => api.get(`/decks/settings/${deckId}`);
export const updateDeckSettings = (deckId, settings) => api.put(`/decks/settings/${deckId}`, settings);