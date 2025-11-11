
const express = require('express');
const authenticateToken = require('./middleware/authenticateToken');

module.exports = (pool) => {
    const router = express.Router();

    // Get all flashcards and deck settings by deckId
    router.get('/:deckId', authenticateToken, async (req, res) => {
        const { deckId } = req.params;
        try {
            // First fetch deck settings
            const deckSettings = await pool.query('SELECT difficulty_enabled, mode FROM deck WHERE id = $1', [deckId]);
            console.log('Deck settings:', deckSettings.rows[0]);

            // Then fetch flashcards
            const result = await pool.query('SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC', [deckId]);
            res.json({ flashcards: result.rows });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Failed to fetch deck data' });
        }
    });



    return router;
};
