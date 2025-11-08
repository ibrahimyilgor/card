
const express = require('express');
module.exports = (pool) => {
    const router = express.Router();

    // Get all flashcards by deckId
    router.get('/:deckId', async (req, res) => {
        const { deckId } = req.params;
        try {
            const result = await pool.query('SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC', [deckId]);
            res.json({ decks: result.rows });
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch decks' });
        }
    });



    return router;
};
