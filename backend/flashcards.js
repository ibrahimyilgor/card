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
	const MAX_FLASHCARD_TEXT_LENGTH = 512;
	const MAX_DECK_TITLE_LENGTH = 255;
	const MAX_DECK_DESCRIPTION_LENGTH = 512;

	const sendLengthValidationError = (res, field, receivedLength, maxLength) => {
		return res.status(400).json({
			error: "Validation failed",
			message: `${field} cannot exceed ${maxLength} characters`,
			field,
			maxLength,
			receivedLength,
		});
	};

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

	// Helper function to check plan limits for flashcard creation
	const checkFlashcardLimit = async (accountId, additionalCount = 1) => {
		// Get user's plan
		const planResult = await pool.query(
			`SELECT p.max_flashcards 
			 FROM account_plan ap
			 JOIN plan p ON ap.plan_id = p.id
			 WHERE ap.account_id = $1 AND ap.is_active = TRUE`,
			[accountId],
		);

		let maxFlashcards;
		if (planResult.rows.length === 0) {
			// Default to free plan limits
			const freePlan = await pool.query(
				"SELECT max_flashcards FROM plan WHERE code = 'free'",
			);
			maxFlashcards = freePlan.rows[0]?.max_flashcards ?? 100;
		} else {
			maxFlashcards = planResult.rows[0].max_flashcards;
		}

		// If maxFlashcards is null, it means unlimited
		if (maxFlashcards === null) {
			return {
				canCreate: true,
				currentFlashcards: 0,
				maxFlashcards: null,
				availableSlots: Infinity,
			};
		}

		// Get current total flashcard count
		const flashcardCountResult = await pool.query(
			`SELECT COUNT(*) as count FROM flashcard f 
			 JOIN deck d ON f.deck_id = d.id 
			 WHERE d.account_id = $1`,
			[accountId],
		);
		const currentFlashcards = parseInt(flashcardCountResult.rows[0].count);
		const availableSlots = maxFlashcards - currentFlashcards;

		return {
			canCreate: currentFlashcards + additionalCount <= maxFlashcards,
			currentFlashcards,
			maxFlashcards,
			availableSlots,
		};
	};

	// Get all flashcards by deckId
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

			const result = await pool.query(
				"SELECT * FROM flashcard WHERE deck_id = $1 ORDER BY id ASC",
				[deckId],
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
		if (!frontText.trim() || !backText.trim()) {
			return res
				.status(400)
				.json({ error: "deckId, frontText and backText required" });
		}
		if (frontText.length > MAX_FLASHCARD_TEXT_LENGTH) {
			return sendLengthValidationError(
				res,
				"frontText",
				frontText.length,
				MAX_FLASHCARD_TEXT_LENGTH,
			);
		}
		if (backText.length > MAX_FLASHCARD_TEXT_LENGTH) {
			return sendLengthValidationError(
				res,
				"backText",
				backText.length,
				MAX_FLASHCARD_TEXT_LENGTH,
			);
		}
		try {
			// Verify deck ownership before creating flashcard
			const { exists, isOwner } = await verifyDeckOwnership(
				parseInt(deckId),
				req.user.accountId,
			);
			if (!exists) return res.status(404).json({ error: "Deck not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			// Check plan limits before creating flashcard
			const limitCheck = await checkFlashcardLimit(req.user.accountId);
			if (!limitCheck.canCreate) {
				return res.status(403).json({
					error: "Flashcard limit reached",
					message: `You have reached your flashcard limit. Current: ${limitCheck.currentFlashcards}, Limit: ${limitCheck.maxFlashcards}. Please delete some flashcards or upgrade your plan.`,
					limitInfo: {
						currentFlashcards: limitCheck.currentFlashcards,
						maxFlashcards: limitCheck.maxFlashcards,
					},
				});
			}

			const result = await pool.query(
				"INSERT INTO flashcard (deck_id, front_text, back_text) VALUES ($1, $2, $3) RETURNING *",
				[deckId, frontText, backText],
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
		if (!frontText?.trim() || !backText?.trim()) {
			return res.status(400).json({ error: "frontText or backText required" });
		}
		if (frontText.length > MAX_FLASHCARD_TEXT_LENGTH) {
			return sendLengthValidationError(
				res,
				"frontText",
				frontText.length,
				MAX_FLASHCARD_TEXT_LENGTH,
			);
		}
		if (backText.length > MAX_FLASHCARD_TEXT_LENGTH) {
			return sendLengthValidationError(
				res,
				"backText",
				backText.length,
				MAX_FLASHCARD_TEXT_LENGTH,
			);
		}
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
				"UPDATE flashcard SET front_text = $1, back_text = $2 WHERE id = $3 RETURNING *",
				[frontText || "", backText || "", flashcardId],
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
				req.user.accountId,
			);
			if (!exists)
				return res.status(404).json({ error: "Flashcard not found" });
			if (!isOwner) return res.status(403).json({ error: "Access denied" });

			const result = await pool.query(
				"DELETE FROM flashcard WHERE id = $1 RETURNING *",
				[flashcardId],
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
		if (title.length > MAX_DECK_TITLE_LENGTH) {
			return sendLengthValidationError(
				res,
				"title",
				title.length,
				MAX_DECK_TITLE_LENGTH,
			);
		}
		if (description && description.length > MAX_DECK_DESCRIPTION_LENGTH) {
			return sendLengthValidationError(
				res,
				"description",
				description.length,
				MAX_DECK_DESCRIPTION_LENGTH,
			);
		}

		// Validate flashcards array
		if (!Array.isArray(flashcards) || flashcards.length === 0) {
			return res.status(400).json({ error: "No valid flashcards to import" });
		}

		// Check deck limit first
		const deckLimitResult = await pool.query(
			`SELECT p.max_decks FROM account_plan ap
			 JOIN plan p ON ap.plan_id = p.id
			 WHERE ap.account_id = $1 AND ap.is_active = TRUE`,
			[accountId],
		);
		let maxDecks = deckLimitResult.rows[0]?.max_decks;
		if (maxDecks === undefined) {
			const freePlan = await pool.query(
				"SELECT max_decks FROM plan WHERE code = 'free'",
			);
			maxDecks = freePlan.rows[0]?.max_decks ?? 3;
		}
		if (maxDecks !== null) {
			const deckCountResult = await pool.query(
				"SELECT COUNT(*) as count FROM deck WHERE account_id = $1",
				[accountId],
			);
			const currentDecks = parseInt(deckCountResult.rows[0].count);
			if (currentDecks >= maxDecks) {
				return res.status(403).json({
					error: "Deck limit reached",
					message: `You have reached your deck limit. Current: ${currentDecks}, Limit: ${maxDecks}. Please delete some decks or upgrade your plan.`,
					limitInfo: { currentDecks, maxDecks },
				});
			}
		}

		// Check flashcard limit
		const flashcardLimitCheck = await checkFlashcardLimit(
			accountId,
			flashcards.length,
		);
		if (!flashcardLimitCheck.canCreate) {
			return res.status(403).json({
				error: "Flashcard limit reached",
				message: `You can only add ${flashcardLimitCheck.availableSlots} more flashcards. Current: ${flashcardLimitCheck.currentFlashcards}, Limit: ${flashcardLimitCheck.maxFlashcards}. Please delete some flashcards or upgrade your plan.`,
				limitInfo: {
					currentFlashcards: flashcardLimitCheck.currentFlashcards,
					maxFlashcards: flashcardLimitCheck.maxFlashcards,
					availableSlots: flashcardLimitCheck.availableSlots,
					requestedCount: flashcards.length,
				},
			});
		}

		const client = await pool.connect();

		try {
			await client.query("BEGIN");

			// Create deck
			const sanitizedTitle = sanitizeText(title);
			const sanitizedDescription = description ? sanitizeText(description) : "";

			const deckResult = await client.query(
				"INSERT INTO deck (account_id, title, description) VALUES ($1, $2, $3) RETURNING *",
				[accountId, sanitizedTitle, sanitizedDescription],
			);
			const newDeck = deckResult.rows[0];

			// Process and insert flashcards
			let importedCount = 0;
			let skippedCount = 0;
			for (const card of flashcards) {
				const front =
					card.front || card.frontText || card.Front || card.FRONT || "";
				const back = card.back || card.backText || card.Back || card.BACK || "";

				// Skip empty cards
				if (!front || !back || front.trim() === "" || back.trim() === "") {
					skippedCount++;
					continue;
				}

				if (
					front.length > MAX_FLASHCARD_TEXT_LENGTH ||
					back.length > MAX_FLASHCARD_TEXT_LENGTH
				) {
					skippedCount++;
					continue;
				}

				// Sanitize
				const sanitizedFront = sanitizeText(front);
				const sanitizedBack = sanitizeText(back);

				// Skip if sanitized result is empty
				if (sanitizedFront.length === 0 || sanitizedBack.length === 0) {
					skippedCount++;
					continue;
				}

				await client.query(
					"INSERT INTO flashcard (deck_id, front_text, back_text) VALUES ($1, $2, $3)",
					[newDeck.id, sanitizedFront, sanitizedBack],
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
