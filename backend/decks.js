
const express = require('express');
module.exports = (pool) => {
	const router = express.Router();

	// Get all decks by accountId
	router.get('/:accountId', async (req, res) => {
		const { accountId } = req.params;
		try {
			const result = await pool.query('SELECT * FROM deck WHERE account_id = $1', [accountId]);
			res.json({ decks: result.rows });
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch decks' });
		}
	});

	// Create a new deck
	router.post('/create', async (req, res) => {
		const { accountId, title, description } = req.body;
		if (!accountId || !title) {
			return res.status(400).json({ error: 'accountId and title required' });
		}
		try {
			const result = await pool.query(
				'INSERT INTO deck (account_id, title, description) VALUES ($1, $2, $3) RETURNING *',
				[accountId, title, description || '']
			);
			res.status(201).json({ deck: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: 'Failed to create deck' });
		}
	});

	// Update an existing deck
	router.put('/:deckId', async (req, res) => {
		const { deckId } = req.params;
		const { title, description } = req.body;
		if (!title) {
			return res.status(400).json({ error: 'title required' });
		}
		try {
			const result = await pool.query(
				'UPDATE deck SET title = $1, description = $2 WHERE id = $3 RETURNING *',
				[title, description || '', deckId]
			);
			if (result.rows.length === 0) {
				return res.status(404).json({ error: 'Deck not found' });
			}
			res.json({ deck: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: 'Failed to update deck' });
		}
	});

	// Get all flashcards by deckId
	router.get('/flashcards/:deckId', async (req, res) => {
		const { deckId } = req.params;
		try {
			const result = await pool.query('SELECT * FROM flashcard WHERE deck_id = $1', [deckId]);
			res.json({ flashcards: result.rows });
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch flashcards' });
		}
	});

	return router;
};
