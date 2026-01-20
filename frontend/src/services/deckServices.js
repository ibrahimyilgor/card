import api from "./api";

// Get all decks for authenticated user (accountId from token)
export const getDecks = () => api.get("/decks");
export const createDeck = (deckData) => api.post("/decks/create", deckData);
export const updateDeck = (deckId, deckData) =>
	api.put(`/decks/${deckId}`, deckData);
export const deleteDeck = (deckId) => api.delete(`/decks/${deckId}`);

export const getDeckSettings = (deckId) => api.get(`/decks/settings/${deckId}`);
export const updateDeckSettings = (deckId, settings) =>
	api.put(`/decks/settings/${deckId}`, settings);

// Import deck with flashcards from CSV/JSON
export const importDeck = (title, description, flashcards) =>
	api.post("/flashcards/import-deck", { title, description, flashcards });
