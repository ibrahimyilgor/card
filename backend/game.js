const express = require("express");
const authenticateToken = require("./middleware/authenticateToken");

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

	// Get all flashcards and deck settings by deckId
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

			// First fetch deck settings
			const deckSettings = await pool.query(
				"SELECT difficulty_enabled, mode FROM deck WHERE id = $1",
				[deckId]
			);
			console.log("Deck settings:", deckSettings.rows[0]);

			// Then fetch flashcards
			const result = await pool.query(
				"SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC",
				[deckId]
			);
			res.json({ flashcards: result.rows });
		} catch (err) {
			console.error("Error:", err);
			res.status(500).json({ error: "Failed to fetch deck data" });
		}
	});

	// Get hard cards only (cards with accuracy below 50%)
	router.get("/:deckId/hard", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		try {
			// Verify deck ownership
			const { exists, isOwner } = await verifyDeckOwnership(
				parseInt(deckId),
				req.user.accountId
			);
			if (!exists) return res.status(404).json({ error: "Deck not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			// Get cards where accuracy is below 50% (and have been answered at least once)
			const result = await pool.query(
				`SELECT * FROM flashcard 
				 WHERE deck_id = $1 
				 AND (correct_count + wrong_count) > 0 
				 AND (correct_count::float / (correct_count + wrong_count)::float) < 0.5 
				 ORDER BY (correct_count::float / (correct_count + wrong_count)::float) ASC`,
				[deckId]
			);
			res.json({ flashcards: result.rows });
		} catch (err) {
			console.error("Error fetching hard cards:", err);
			res.status(500).json({ error: "Failed to fetch hard cards" });
		}
	});

	// Get flashcards with multiple choice options
	router.get("/:deckId/options", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		try {
			// Verify deck ownership
			const { exists, isOwner } = await verifyDeckOwnership(
				parseInt(deckId),
				req.user.accountId
			);
			if (!exists) return res.status(404).json({ error: "Deck not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			// Fetch all flashcards for this deck
			const result = await pool.query(
				"SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC",
				[deckId]
			);
			const flashcards = result.rows;

			// Generate options for each flashcard
			const flashcardsWithOptions = flashcards.map((card, index) => {
				// Get 3 random wrong answers from other cards
				const otherCards = flashcards.filter((_, i) => i !== index);
				const shuffledOthers = otherCards
					.sort(() => Math.random() - 0.5)
					.slice(0, 3);

				// Create options array with correct answer and wrong answers
				const options = [
					{ text: card.back_text, isCorrect: true },
					...shuffledOthers.map((c) => ({
						text: c.back_text,
						isCorrect: false,
					})),
				];

				// Shuffle options
				const shuffledOptions = options.sort(() => Math.random() - 0.5);

				return {
					...card,
					options: shuffledOptions,
				};
			});

			res.json({ flashcards: flashcardsWithOptions });
		} catch (err) {
			console.error("Error fetching flashcards with options:", err);
			res
				.status(500)
				.json({ error: "Failed to fetch flashcards with options" });
		}
	});

	// Validate typed answer for write mode
	router.post("/validate-answer", authenticateToken, async (req, res) => {
		const { flashcardId, userAnswer } = req.body;
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
				"SELECT back_text FROM flashcard WHERE id = $1",
				[flashcardId]
			);
			const correctAnswer = result.rows[0].back_text;

			// Normalize both answers for comparison (lowercase, trim whitespace)
			const normalizedUserAnswer = userAnswer.toLowerCase().trim();
			const normalizedCorrectAnswer = correctAnswer.toLowerCase().trim();

			// Check for exact match or close match (allowing minor typos)
			const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

			// Calculate similarity for partial credit
			const similarity = calculateSimilarity(
				normalizedUserAnswer,
				normalizedCorrectAnswer
			);

			res.json({
				correct: isCorrect,
				similarity: similarity,
				correctAnswer: correctAnswer,
				isClose: similarity > 0.8 && !isCorrect,
			});
		} catch (err) {
			console.error("Error validating answer:", err);
			res.status(500).json({ error: "Failed to validate answer" });
		}
	});

	// Update flashcard statistics after answering
	router.post("/update-stats", authenticateToken, async (req, res) => {
		const { flashcardId, isCorrect } = req.body;
		try {
			// Verify flashcard ownership
			const { exists, isOwner } = await verifyFlashcardOwnership(
				parseInt(flashcardId),
				req.user.accountId
			);
			if (!exists)
				return res.status(404).json({ error: "Flashcard not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			if (isCorrect) {
				await pool.query(
					"UPDATE flashcard SET correct_count = COALESCE(correct_count, 0) + 1, updated_at = NOW() WHERE id = $1",
					[flashcardId]
				);
			} else {
				await pool.query(
					"UPDATE flashcard SET wrong_count = COALESCE(wrong_count, 0) + 1, updated_at = NOW() WHERE id = $1",
					[flashcardId]
				);
			}
			res.json({ success: true });
		} catch (err) {
			console.error("Error updating flashcard stats:", err);
			res.status(500).json({ error: "Failed to update stats" });
		}
	});

	// Helper function to calculate string similarity (Levenshtein distance based)
	function calculateSimilarity(str1, str2) {
		const longer = str1.length > str2.length ? str1 : str2;
		const shorter = str1.length > str2.length ? str2 : str1;

		if (longer.length === 0) return 1.0;

		const editDistance = levenshteinDistance(longer, shorter);
		return (longer.length - editDistance) / longer.length;
	}

	function levenshteinDistance(str1, str2) {
		const matrix = [];

		for (let i = 0; i <= str2.length; i++) {
			matrix[i] = [i];
		}

		for (let j = 0; j <= str1.length; j++) {
			matrix[0][j] = j;
		}

		for (let i = 1; i <= str2.length; i++) {
			for (let j = 1; j <= str1.length; j++) {
				if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
					matrix[i][j] = matrix[i - 1][j - 1];
				} else {
					matrix[i][j] = Math.min(
						matrix[i - 1][j - 1] + 1,
						matrix[i][j - 1] + 1,
						matrix[i - 1][j] + 1
					);
				}
			}
		}

		return matrix[str2.length][str1.length];
	}

	return router;
};
