
const express = require('express');
const authenticateToken = require('./middleware/authenticateToken');

module.exports = (pool) => {
    const router = express.Router();

    // Get all flashcards by deckId
    router.get('/:deckId', authenticateToken, async (req, res) => {
        const { deckId } = req.params;
        try {
            const result = await pool.query('SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC', [deckId]);
            res.json({ decks: result.rows });
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch decks' });
        }
    });

    // Create a new flashcard
    router.post('/create', authenticateToken, async (req, res) => {
        const { deckId, frontText, backText } = req.body;
        if (!deckId || !frontText || !backText) {
            return res.status(400).json({ error: 'deckId, frontText and backText required' });
        }
        try {
            const result = await pool.query(
                'INSERT INTO flashcard (deck_id, front_text, back_text) VALUES ($1, $2, $3) RETURNING *',
                [deckId, frontText, backText]
            );
            res.status(201).json({ flashcard: result.rows[0] });
        } catch (err) {
            res.status(500).json({ error: 'Failed to create flashcard' });
        }
    });

    // Update an existing flashcard
    router.put('/:flashcardId', authenticateToken, async (req, res) => {
        const { flashcardId } = req.params;
        const { frontText, backText } = req.body;
        if (!frontText && !backText) {
            return res.status(400).json({ error: 'frontText or backText required' });
        }
        try {
            const result = await pool.query(
                'UPDATE flashcard SET front_text = $1, back_text = $2 WHERE id = $3 RETURNING *',
                [frontText || '', backText || '', flashcardId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Flashcard not found' });
            }
            res.json({ flashcard: result.rows[0] });
        } catch (err) {
            res.status(500).json({ error: 'Failed to update flashcard' });
        }
    });

        // Update a flashcard
        router.put('/:id', authenticateToken, async (req, res) => {
            const { id } = req.params;
            const { frontText, backText } = req.body;
            try {
                const result = await pool.query(
                    'UPDATE flashcard SET front_text = $1, back_text = $2 WHERE id = $3 RETURNING *',
                    [frontText, backText, id]
                );
                if (result.rows.length > 0) {
                    res.json({ flashcard: result.rows[0] });
                } else {
                    res.status(404).json({ error: 'Flashcard not found' });
                }
            } catch (err) {
                res.status(500).json({ error: 'Failed to update flashcard' });
            }
        });

    // Delete a flashcard
    router.delete('/:flashcardId', authenticateToken, async (req, res) => {
        const { flashcardId } = req.params;
        try {
            const result = await pool.query('DELETE FROM flashcard WHERE id = $1 RETURNING *', [flashcardId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Flashcard not found' });
            }
            res.json({ message: 'Flashcard deleted successfully', flashcard: result.rows[0] });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete flashcard' });
        }
    });


    return router;
};
