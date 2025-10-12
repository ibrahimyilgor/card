const express = require('express');
module.exports = (pool) => {
	const router = express.Router();

	// Get all decks by userId
	router.get('/decks/:userId', async (req, res) => {
		const { userId } = req.params;
		try {
			const result = await pool.query('SELECT * FROM decks WHERE user_id = $1', [userId]);
			res.json({ decks: result.rows });
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch decks' });
		}
	});

	// Get all flashcards by deckId
	router.get('/flashcards/:deckId', async (req, res) => {
		const { deckId } = req.params;
		try {
			const result = await pool.query('SELECT * FROM flashcards WHERE deck_id = $1', [deckId]);
			res.json({ flashcards: result.rows });
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch flashcards' });
		}
	});

	return router;
};
