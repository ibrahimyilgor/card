const express = require("express");
const validator = require("validator");
const authenticateToken = require("./middleware/authenticateToken");

// Sanitize text to prevent XSS
const sanitizeText = (text) => {
	if (typeof text !== "string") return "";
	// Escape HTML entities and trim
	return validator.escape(text.trim());
};

module.exports = (pool) => {
	const router = express.Router();

	// Helper function to verify deck ownership
	const verifyDeckOwnership = async (deckId, accountId) => {
		const result = await pool.query(
			"SELECT account_id FROM deck WHERE id = $1",
			[deckId]
		);
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
	router.get("/:deckId", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		try {
			// Verify deck ownership
			const { exists, isOwner } = await verifyDeckOwnership(
				parseInt(deckId),
				req.user.accountId
			);
			if (!exists) return res.status(404).json({ error: "Deck not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			const result = await pool.query(
				"SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC",
				[deckId]
			);
			res.json({ decks: result.rows });
		} catch (err) {
			res.status(500).json({ error: "Failed to fetch decks" });
		}
	});

	// Create a new flashcard
	router.post("/create", authenticateToken, async (req, res) => {
		const { deckId, frontText, backText } = req.body;
		if (!deckId || !frontText || !backText) {
			return res
				.status(400)
				.json({ error: "deckId, frontText and backText required" });
		}
		try {
			// Verify deck ownership before creating flashcard
			const { exists, isOwner } = await verifyDeckOwnership(
				parseInt(deckId),
				req.user.accountId
			);
			if (!exists) return res.status(404).json({ error: "Deck not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			const result = await pool.query(
				"INSERT INTO flashcard (deck_id, front_text, back_text) VALUES ($1, $2, $3) RETURNING *",
				[deckId, frontText, backText]
			);
			res.status(201).json({ flashcard: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to create flashcard" });
		}
	});

	// Update an existing flashcard
	router.put("/:flashcardId", authenticateToken, async (req, res) => {
		const { flashcardId } = req.params;
		const { frontText, backText } = req.body;
		if (!frontText && !backText) {
			return res.status(400).json({ error: "frontText or backText required" });
		}
		try {
			// Verify flashcard ownership
			const { exists, isOwner } = await verifyFlashcardOwnership(
				parseInt(flashcardId),
				req.user.accountId
			);
			if (!exists)
				return res.status(404).json({ error: "Flashcard not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			const result = await pool.query(
				"UPDATE flashcard SET front_text = $1, back_text = $2 WHERE id = $3 RETURNING *",
				[frontText || "", backText || "", flashcardId]
			);
			res.json({ flashcard: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to update flashcard" });
		}
	});

	// Delete a flashcard
	router.delete("/:flashcardId", authenticateToken, async (req, res) => {
		const { flashcardId } = req.params;
		try {
			// Verify flashcard ownership
			const { exists, isOwner } = await verifyFlashcardOwnership(
				parseInt(flashcardId),
				req.user.accountId
			);
			if (!exists)
				return res.status(404).json({ error: "Flashcard not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			const result = await pool.query(
				"DELETE FROM flashcard WHERE id = $1 RETURNING *",
				[flashcardId]
			);
			res.json({
				message: "Flashcard deleted successfully",
				flashcard: result.rows[0],
			});
		} catch (err) {
			res.status(500).json({ error: "Failed to delete flashcard" });
		}
	});

	// Import deck with flashcards (CSV/JSON)
	router.post("/import-deck", authenticateToken, async (req, res) => {
		const { title, description, flashcards } = req.body;
		const accountId = req.user.accountId;

		// Validate title
		if (!title || typeof title !== "string" || title.trim().length === 0) {
			return res.status(400).json({ error: "Deck title is required" });
		}

		// Validate flashcards array
		if (!Array.isArray(flashcards) || flashcards.length === 0) {
			return res.status(400).json({ error: "No valid flashcards to import" });
		}

		const client = await pool.connect();

		try {
			await client.query("BEGIN");

			// Create deck
			const sanitizedTitle = sanitizeText(title).substring(0, 255);
			const sanitizedDescription = description
				? sanitizeText(description).substring(0, 1000)
				: "";

			const deckResult = await client.query(
				"INSERT INTO deck (account_id, title, description) VALUES ($1, $2, $3) RETURNING *",
				[accountId, sanitizedTitle, sanitizedDescription]
			);
			const newDeck = deckResult.rows[0];

			// Process and insert flashcards
			let importedCount = 0;
			let skippedCount = 0;
			const MAX_TEXT_LENGTH = 5000;

			for (const card of flashcards) {
				const front =
					card.front || card.frontText || card.Front || card.FRONT || "";
				const back = card.back || card.backText || card.Back || card.BACK || "";

				// Skip empty cards
				if (!front || !back || front.trim() === "" || back.trim() === "") {
					skippedCount++;
					continue;
				}

				// Sanitize and truncate
				const sanitizedFront = sanitizeText(front).substring(
					0,
					MAX_TEXT_LENGTH
				);
				const sanitizedBack = sanitizeText(back).substring(0, MAX_TEXT_LENGTH);

				// Skip if sanitized result is empty
				if (sanitizedFront.length === 0 || sanitizedBack.length === 0) {
					skippedCount++;
					continue;
				}

				await client.query(
					"INSERT INTO flashcard (deck_id, front_text, back_text) VALUES ($1, $2, $3)",
					[newDeck.id, sanitizedFront, sanitizedBack]
				);
				importedCount++;
			}

			// If no cards were imported, rollback
			if (importedCount === 0) {
				await client.query("ROLLBACK");
				return res.status(400).json({ error: "No valid flashcards to import" });
			}

			await client.query("COMMIT");

			res.status(201).json({
				message: "Deck imported successfully",
				deck: newDeck,
				importedCount,
				skippedCount,
			});
		} catch (err) {
			await client.query("ROLLBACK");
			console.error("Import error:", err);
			res.status(500).json({ error: "Failed to import deck" });
		} finally {
			client.release();
		}
	});

	return router;
};
