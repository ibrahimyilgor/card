const express = require("express");
const authenticateToken = require("./middleware/authenticateToken");

// Fisher-Yates shuffle - proper random distribution
function shuffleArray(array) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

module.exports = (pool) => {
	const router = express.Router();

	// Helper function to verify deck ownership
	const verifyDeckOwnership = async (deckId, accountId) => {
		const result = await pool.query(
			"SELECT account_id FROM deck WHERE id = $1",
			[deckId],
		);
		if (result.rows.length === 0) return { exists: false, isOwner: false };
		return {
			exists: true,
			isOwner: parseInt(result.rows[0].account_id) === parseInt(accountId),
		};
	};

	// Helper function to verify flashcard ownership via deck
	const verifyFlashcardOwnership = async (flashcardId, accountId) => {
		const result = await pool.query(
			`SELECT d.account_id FROM flashcard f 
             JOIN deck d ON f.deck_id = d.id 
             WHERE f.id = $1`,
			[flashcardId],
		);
		if (result.rows.length === 0) return { exists: false, isOwner: false };
		return {
			exists: true,
			isOwner: parseInt(result.rows[0].account_id) === parseInt(accountId),
		};
	};

	// Helper function to check if user can play (within plan limits)
	const checkCanPlay = async (accountId) => {
		// Get user's plan
		const planResult = await pool.query(
			`SELECT p.code, p.max_decks, p.max_flashcards 
			 FROM account_plan ap
			 JOIN plan p ON ap.plan_id = p.id
			 WHERE ap.account_id = $1 AND ap.is_active = TRUE`,
			[accountId],
		);

		let plan;
		if (planResult.rows.length === 0) {
			// Default to free plan
			const freePlan = await pool.query(
				"SELECT code, max_decks, max_flashcards FROM plan WHERE code = 'free'",
			);
			plan = freePlan.rows[0];
		} else {
			plan = planResult.rows[0];
		}

		// Get current deck count
		const deckCountResult = await pool.query(
			"SELECT COUNT(*) as count FROM deck WHERE account_id = $1",
			[accountId],
		);
		const currentDecks = parseInt(deckCountResult.rows[0].count);

		// Get total flashcard count
		const flashcardCountResult = await pool.query(
			`SELECT COUNT(*) as count FROM flashcard f 
			 JOIN deck d ON f.deck_id = d.id 
			 WHERE d.account_id = $1`,
			[accountId],
		);
		const currentFlashcards = parseInt(flashcardCountResult.rows[0].count);

		const maxDecks = plan.max_decks;
		const maxFlashcards = plan.max_flashcards;

		const deckOverage =
			maxDecks !== null ? Math.max(0, currentDecks - maxDecks) : 0;
		const flashcardOverage =
			maxFlashcards !== null
				? Math.max(0, currentFlashcards - maxFlashcards)
				: 0;

		return {
			canPlay: deckOverage === 0 && flashcardOverage === 0,
			currentDecks,
			currentFlashcards,
			maxDecks,
			maxFlashcards,
			deckOverage,
			flashcardOverage,
			planCode: plan.code,
		};
	};

	// Get all flashcards and deck settings by deckId
	router.get("/:deckId", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		try {
			// Verify deck ownership
			const { exists, isOwner } = await verifyDeckOwnership(
				parseInt(deckId),
				req.user.accountId,
			);
			if (!exists) return res.status(404).json({ error: "Deck not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			// Check if user can play (within plan limits)
			const playCheck = await checkCanPlay(req.user.accountId);
			if (!playCheck.canPlay) {
				let message =
					"You have exceeded your plan limits and cannot play until you reduce your content:\n";
				if (playCheck.deckOverage > 0) {
					message += `• Deck limit: ${playCheck.maxDecks}, Current: ${playCheck.currentDecks}. Please delete ${playCheck.deckOverage} deck(s).\n`;
				}
				if (playCheck.flashcardOverage > 0) {
					message += `• Flashcard limit: ${playCheck.maxFlashcards}, Current: ${playCheck.currentFlashcards}. Please delete ${playCheck.flashcardOverage} flashcard(s).\n`;
				}
				message += "Or upgrade your plan to continue playing.";

				return res.status(403).json({
					error: "Plan limit exceeded",
					message,
					limitInfo: {
						currentDecks: playCheck.currentDecks,
						maxDecks: playCheck.maxDecks,
						deckOverage: playCheck.deckOverage,
						currentFlashcards: playCheck.currentFlashcards,
						maxFlashcards: playCheck.maxFlashcards,
						flashcardOverage: playCheck.flashcardOverage,
						planCode: playCheck.planCode,
					},
				});
			}

			// First fetch deck settings
			const deckSettings = await pool.query(
				"SELECT difficulty_enabled, mode FROM deck WHERE id = $1",
				[deckId],
			);
			console.log("Deck settings:", deckSettings.rows[0]);

			// Then fetch flashcards
			const result = await pool.query(
				"SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC",
				[deckId],
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
				req.user.accountId,
			);
			if (!exists) return res.status(404).json({ error: "Deck not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			// Check if user can play (within plan limits)
			const playCheck = await checkCanPlay(req.user.accountId);
			if (!playCheck.canPlay) {
				let message =
					"You have exceeded your plan limits and cannot play until you reduce your content:\n";
				if (playCheck.deckOverage > 0) {
					message += `• Deck limit: ${playCheck.maxDecks}, Current: ${playCheck.currentDecks}. Please delete ${playCheck.deckOverage} deck(s).\n`;
				}
				if (playCheck.flashcardOverage > 0) {
					message += `• Flashcard limit: ${playCheck.maxFlashcards}, Current: ${playCheck.currentFlashcards}. Please delete ${playCheck.flashcardOverage} flashcard(s).\n`;
				}
				message += "Or upgrade your plan to continue playing.";
				return res.status(403).json({
					error: "Plan limit exceeded",
					message,
					limitInfo: {
						currentDecks: playCheck.currentDecks,
						maxDecks: playCheck.maxDecks,
						deckOverage: playCheck.deckOverage,
						currentFlashcards: playCheck.currentFlashcards,
						maxFlashcards: playCheck.maxFlashcards,
						flashcardOverage: playCheck.flashcardOverage,
						planCode: playCheck.planCode,
					},
				});
			}

			// Get cards where accuracy is below 50% (and have been answered at least once)
			const result = await pool.query(
				`SELECT * FROM flashcard 
				 WHERE deck_id = $1 
				 AND (correct_count + wrong_count) > 0 
				 AND (correct_count::float / (correct_count + wrong_count)::float) < 0.5 
				 ORDER BY (correct_count::float / (correct_count + wrong_count)::float) ASC`,
				[deckId],
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
				req.user.accountId,
			);
			if (!exists) return res.status(404).json({ error: "Deck not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			// Check if user can play (within plan limits)
			const playCheck = await checkCanPlay(req.user.accountId);
			if (!playCheck.canPlay) {
				let message =
					"You have exceeded your plan limits and cannot play until you reduce your content:\n";
				if (playCheck.deckOverage > 0) {
					message += `• Deck limit: ${playCheck.maxDecks}, Current: ${playCheck.currentDecks}. Please delete ${playCheck.deckOverage} deck(s).\n`;
				}
				if (playCheck.flashcardOverage > 0) {
					message += `• Flashcard limit: ${playCheck.maxFlashcards}, Current: ${playCheck.currentFlashcards}. Please delete ${playCheck.flashcardOverage} flashcard(s).\n`;
				}
				message += "Or upgrade your plan to continue playing.";
				return res.status(403).json({
					error: "Plan limit exceeded",
					message,
					limitInfo: {
						currentDecks: playCheck.currentDecks,
						maxDecks: playCheck.maxDecks,
						deckOverage: playCheck.deckOverage,
						currentFlashcards: playCheck.currentFlashcards,
						maxFlashcards: playCheck.maxFlashcards,
						flashcardOverage: playCheck.flashcardOverage,
						planCode: playCheck.planCode,
					},
				});
			}

			// Fetch all flashcards for this deck
			const result = await pool.query(
				"SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC",
				[deckId],
			);
			const flashcards = result.rows;

			// Generate options for each flashcard
			const flashcardsWithOptions = flashcards.map((card, index) => {
				// Get 3 random wrong answers from other cards
				const otherCards = flashcards.filter((_, i) => i !== index);
				const shuffledOthers = shuffleArray(otherCards).slice(0, 3);

				// Create options array with correct answer and wrong answers
				const options = [
					{ text: card.back_text, isCorrect: true },
					...shuffledOthers.map((c) => ({
						text: c.back_text,
						isCorrect: false,
					})),
				];

				// Shuffle options with Fisher-Yates for proper distribution
				const shuffledOptions = shuffleArray(options);

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
				req.user.accountId,
			);
			if (!exists)
				return res.status(404).json({ error: "Flashcard not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			const result = await pool.query(
				"SELECT back_text FROM flashcard WHERE id = $1",
				[flashcardId],
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
				normalizedCorrectAnswer,
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
				req.user.accountId,
			);
			if (!exists)
				return res.status(404).json({ error: "Flashcard not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			if (isCorrect) {
				await pool.query(
					"UPDATE flashcard SET correct_count = COALESCE(correct_count, 0) + 1, updated_at = NOW() WHERE id = $1",
					[flashcardId],
				);
			} else {
				await pool.query(
					"UPDATE flashcard SET wrong_count = COALESCE(wrong_count, 0) + 1, updated_at = NOW() WHERE id = $1",
					[flashcardId],
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
						matrix[i - 1][j] + 1,
					);
				}
			}
		}

		return matrix[str2.length][str1.length];
	}

	return router;
};
