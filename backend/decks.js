
const express = require('express');
module.exports = (pool) => {
	const router = express.Router();

	// Get all decks by accountId
	router.get('/:accountId', async (req, res) => {
		const { accountId } = req.params;
		try {
			const result = await pool.query('SELECT * FROM deck WHERE account_id = $1 ORDER BY id ASC', [accountId]);
			res.json({ decks: result.rows });
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch decks' });
		}
	});

	// Create a new deck
	router.post('/create', async (req, res) => {
		const { accountId, title, description, difficulty_enabled, mode } = req.body;
		if (!accountId || !title) {
			return res.status(400).json({ error: 'accountId and title required' });
		}
		try {
			const result = await pool.query(
				'INSERT INTO deck (account_id, title, description, difficulty_enabled, mode) VALUES ($1, $2, $3, $4, $5) RETURNING *',
				[accountId, title, description || '', difficulty_enabled || false, mode || 'standard']
			);
			res.status(201).json({ deck: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: 'Failed to create deck' });
		}
	});

	// Update an existing deck
	router.put('/:deckId', async (req, res) => {
		const { deckId } = req.params;
		const { title, description, difficulty_enabled, mode } = req.body;
		if (!title) {
			return res.status(400).json({ error: 'title required' });
		}
		try {
			const result = await pool.query(
				'UPDATE deck SET title = $1, description = $2, difficulty_enabled = $3, mode = $4 WHERE id = $5 RETURNING *',
				[title, description || '', difficulty_enabled || false, mode || 'standard', deckId]
			);
			if (result.rows.length === 0) {
				return res.status(404).json({ error: 'Deck not found' });
			}
			res.json({ deck: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: 'Failed to update deck' });
		}
	});

	// Get deck settings
	router.get('/settings/:deckId', async (req, res) => {
		const { deckId } = req.params;
		try {
			const result = await pool.query(
				'SELECT difficulty_enabled, mode FROM deck WHERE id = $1',
				[deckId]
			);
			if (result.rows.length === 0) {
				return res.status(404).json({ error: 'Deck not found' });
			}
			res.json({ settings: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: 'Failed to fetch deck settings' });
		}
	});

	// Update deck settings
	router.put('/settings/:deckId', async (req, res) => {
		const { deckId } = req.params;
		const { difficulty_enabled, mode } = req.body;
		try {
			const result = await pool.query(
				'UPDATE deck SET difficulty_enabled = $1, mode = $2 WHERE id = $3 RETURNING *',
				[difficulty_enabled, mode, deckId]
			);
			if (result.rows.length === 0) {
				return res.status(404).json({ error: 'Deck not found' });
			}
			res.json({ settings: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: 'Failed to update deck settings' });
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

	// Delete a deck and its flashcards
	router.delete('/:deckId', async (req, res) => {
		const { deckId } = req.params;
		try {
			// Start a transaction to ensure both operations complete or none do
			await pool.query('BEGIN');
			
			// First delete all flashcards in the deck
			await pool.query('DELETE FROM flashcard WHERE deck_id = $1', [deckId]);
			
			// Then delete the deck itself
			const result = await pool.query('DELETE FROM deck WHERE id = $1 RETURNING *', [deckId]);
			
			// Commit the transaction
			await pool.query('COMMIT');

			if (result.rows.length === 0) {
				return res.status(404).json({ error: 'Deck not found' });
			}

			res.json({ message: 'Deck and its flashcards deleted successfully', deck: result.rows[0] });
		} catch (err) {
			// If there's an error, rollback the transaction
			await pool.query('ROLLBACK');
			res.status(500).json({ error: 'Failed to delete deck' });
		}
	});

	return router;
};
