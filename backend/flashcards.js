
const express = require('express');
const authenticateToken = require('./middleware/authenticateToken');

module.exports = (pool) => {
    const router = express.Router();

    // Helper function to verify deck ownership
    const verifyDeckOwnership = async (deckId, accountId) => {
        const result = await pool.query('SELECT account_id FROM deck WHERE id = $1', [deckId]);
        if (result.rows.length === 0) return { exists: false, isOwner: false };
        return { exists: true, isOwner: result.rows[0].account_id === accountId };
    };

    // Helper function to verify flashcard ownership via deck
    const verifyFlashcardOwnership = async (flashcardId, accountId) => {
        const result = await pool.query(
            `SELECT d.account_id FROM flashcard f 
             JOIN deck d ON f.deck_id = d.id 
             WHERE f.id = $1`,
            [flashcardId]
        );
        if (result.rows.length === 0) return { exists: false, isOwner: false };
        return { exists: true, isOwner: result.rows[0].account_id === accountId };
    };

    // Get all flashcards by deckId
    router.get('/:deckId', authenticateToken, async (req, res) => {
        const { deckId } = req.params;
        try {
            // Verify deck ownership
            const { exists, isOwner } = await verifyDeckOwnership(parseInt(deckId), req.user.accountId);
            if (!exists) return res.status(404).json({ error: 'Deck not found' });
            if (!isOwner) return res.status(403).json({ error: 'Access denied' });

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
            // Verify deck ownership before creating flashcard
            const { exists, isOwner } = await verifyDeckOwnership(parseInt(deckId), req.user.accountId);
            if (!exists) return res.status(404).json({ error: 'Deck not found' });
            if (!isOwner) return res.status(403).json({ error: 'Access denied' });

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
            // Verify flashcard ownership
            const { exists, isOwner } = await verifyFlashcardOwnership(parseInt(flashcardId), req.user.accountId);
            if (!exists) return res.status(404).json({ error: 'Flashcard not found' });
            if (!isOwner) return res.status(403).json({ error: 'Access denied' });

            const result = await pool.query(
                'UPDATE flashcard SET front_text = $1, back_text = $2 WHERE id = $3 RETURNING *',
                [frontText || '', backText || '', flashcardId]
            );
            res.json({ flashcard: result.rows[0] });
        } catch (err) {
            res.status(500).json({ error: 'Failed to update flashcard' });
        }
    });

    // Delete a flashcard
    router.delete('/:flashcardId', authenticateToken, async (req, res) => {
        const { flashcardId } = req.params;
        try {
            // Verify flashcard ownership
            const { exists, isOwner } = await verifyFlashcardOwnership(parseInt(flashcardId), req.user.accountId);
            if (!exists) return res.status(404).json({ error: 'Flashcard not found' });
            if (!isOwner) return res.status(403).json({ error: 'Access denied' });

            const result = await pool.query('DELETE FROM flashcard WHERE id = $1 RETURNING *', [flashcardId]);
            res.json({ message: 'Flashcard deleted successfully', flashcard: result.rows[0] });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete flashcard' });
        }
    });


    return router;
};
