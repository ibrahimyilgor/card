const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");

module.exports = (pool) => {
	const router = express.Router();
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
		if (result.rows.length === 0) {
			return { exists: false, isOwner: false };
		}
		return {
			exists: true,
			isOwner: parseInt(result.rows[0].account_id) === parseInt(accountId),
		};
	};

	// Helper function to check plan limits for deck creation
	const checkDeckLimit = async (accountId) => {
		// Get user's plan
		const planResult = await pool.query(
			`SELECT p.max_decks 
			 FROM account_plan ap
			 JOIN plan p ON ap.plan_id = p.id
			 WHERE ap.account_id = $1 AND ap.is_active = TRUE`,
			[accountId],
		);

		let maxDecks;
		if (planResult.rows.length === 0) {
			// Default to free plan limits
			const freePlan = await pool.query(
				"SELECT max_decks FROM plan WHERE code = 'free'",
			);
			maxDecks = freePlan.rows[0]?.max_decks ?? 3;
		} else {
			maxDecks = planResult.rows[0].max_decks;
		}

		// If maxDecks is null, it means unlimited
		if (maxDecks === null) {
			return { canCreate: true, currentDecks: 0, maxDecks: null };
		}

		// Get current deck count
		const deckCountResult = await pool.query(
			"SELECT COUNT(*) as count FROM deck WHERE account_id = $1",
			[accountId],
		);
		const currentDecks = parseInt(deckCountResult.rows[0].count);

		return {
			canCreate: currentDecks < maxDecks,
			currentDecks,
			maxDecks,
		};
	};

	// Get all decks for authenticated user
	router.get("/", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		try {
			// Include finished_today flag per deck for this account
			const result = await pool.query(
				`
				SELECT d.*, COUNT(f.id) as flashcard_count,
				EXISTS(
					SELECT 1 FROM study_session s
					WHERE s.account_id = $1 AND s.deck_id = d.id AND DATE(s.session_date) = CURRENT_DATE
				) AS finished_today
				FROM deck d 
				LEFT JOIN flashcard f ON d.id = f.deck_id 
				WHERE d.account_id = $1 
				GROUP BY d.id 
				ORDER BY d.id ASC
			`,
				[accountId],
			);
			res.json({ decks: result.rows });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch decks" });
		}
	});

	// Legacy: Get all decks by accountId (for backwards compatibility)
	router.get("/:accountId", authenticateToken, async (req, res) => {
		const { accountId } = req.params;
		// Verify user can only access their own decks
		if (parseInt(accountId) !== req.user.accountId) {
			return res.status(403).json({ error: "Access denied" });
		}
		try {
			const result = await pool.query(
				`
				SELECT d.*, COUNT(f.id) as flashcard_count,
				EXISTS(
					SELECT 1 FROM study_session s
					WHERE s.account_id = $1 AND s.deck_id = d.id AND DATE(s.session_date) = CURRENT_DATE
				) AS finished_today
				FROM deck d 
				LEFT JOIN flashcard f ON d.id = f.deck_id 
				WHERE d.account_id = $1 
				GROUP BY d.id 
				ORDER BY d.id ASC
			`,
				[accountId],
			);
			res.json({ decks: result.rows });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch decks" });
		}
	});

	// Create a new deck
	router.post("/create", authenticateToken, async (req, res) => {
		const { title, description, difficulty_enabled, mode, card_direction } =
			req.body;
		// Use accountId from token, not from body
		const accountId = req.user.accountId;
		if (!title || !title.trim()) {
			return res.status(400).json({ error: "title required" });
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
		try {
			// Check plan limits before creating deck
			const limitCheck = await checkDeckLimit(accountId);
			if (!limitCheck.canCreate) {
				return res.status(403).json({
					error: "Deck limit reached",
					message: `You have reached your deck limit. Current: ${limitCheck.currentDecks}, Limit: ${limitCheck.maxDecks}. Please delete some decks or upgrade your plan.`,
					limitInfo: {
						currentDecks: limitCheck.currentDecks,
						maxDecks: limitCheck.maxDecks,
					},
				});
			}

			const result = await pool.query(
				"INSERT INTO deck (account_id, title, description, difficulty_enabled, mode, card_direction) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
				[
					accountId,
					title,
					description || "",
					difficulty_enabled || false,
					mode || "standard",
					card_direction || "normal",
				],
			);
			res.status(201).json({ deck: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to create deck" });
		}
	});

	// Update an existing deck
	router.put("/:deckId", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		const { title, description, difficulty_enabled, mode, card_direction } =
			req.body;
		if (!title || !title.trim()) {
			return res.status(400).json({ error: "title required" });
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
		try {
			// Verify ownership
			const ownership = await verifyDeckOwnership(deckId, req.user.accountId);
			if (!ownership.exists) {
				return res.status(404).json({ error: "Deck not found" });
			}
			if (!ownership.isOwner) {
				return res.status(403).json({ error: "Access denied" });
			}

			const result = await pool.query(
				"UPDATE deck SET title = $1, description = $2, difficulty_enabled = $3, mode = $4, card_direction = $5 WHERE id = $6 RETURNING *",
				[
					title,
					description || "",
					difficulty_enabled || false,
					mode || "standard",
					card_direction || "normal",
					deckId,
				],
			);
			res.json({ deck: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to update deck" });
		}
	});

	// Get deck settings
	router.get("/settings/:deckId", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		try {
			// Verify ownership
			const ownership = await verifyDeckOwnership(deckId, req.user.accountId);
			if (!ownership.exists) {
				return res.status(404).json({ error: "Deck not found" });
			}
			if (!ownership.isOwner) {
				return res.status(403).json({ error: "Access denied" });
			}

			const result = await pool.query(
				`SELECT d.difficulty_enabled, d.mode, d.card_direction, d.challenge_type, d.time_limit, d.starting_lives,
						COUNT(f.id)::int AS flashcard_count
				 FROM deck d
				 LEFT JOIN flashcard f ON f.deck_id = d.id AND f.enabled = TRUE
				 WHERE d.id = $1
				 GROUP BY d.id`,
				[deckId],
			);
			res.json({ settings: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to fetch deck settings" });
		}
	});

	// Update deck settings
	router.put("/settings/:deckId", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		const {
			difficulty_enabled,
			mode,
			card_direction,
			challenge_type,
			time_limit,
			starting_lives,
		} = req.body;
		const effectiveCardDirection =
			mode === "match" ? "normal" : card_direction || "normal";
		try {
			// Verify ownership
			const ownership = await verifyDeckOwnership(deckId, req.user.accountId);
			if (!ownership.exists) {
				return res.status(404).json({ error: "Deck not found" });
			}
			if (!ownership.isOwner) {
				return res.status(403).json({ error: "Access denied" });
			}

			const result = await pool.query(
				"UPDATE deck SET difficulty_enabled = $1, mode = $2, card_direction = $3, challenge_type = $4, time_limit = $5, starting_lives = $6 WHERE id = $7 RETURNING *",
				[
					difficulty_enabled,
					mode,
					effectiveCardDirection,
					challenge_type || "none",
					time_limit || 60,
					starting_lives || 3,
					deckId,
				],
			);
			res.json({ settings: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to update deck settings" });
		}
	});

	// Get all flashcards by deckId
	router.get("/flashcards/:deckId", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		try {
			// Verify ownership
			const ownership = await verifyDeckOwnership(deckId, req.user.accountId);
			if (!ownership.exists) {
				return res.status(404).json({ error: "Deck not found" });
			}
			if (!ownership.isOwner) {
				return res.status(403).json({ error: "Access denied" });
			}

			const result = await pool.query(
				"SELECT * FROM flashcard WHERE deck_id = $1",
				[deckId],
			);
			res.json({ flashcards: result.rows });
		} catch (err) {
			res.status(500).json({ error: "Failed to fetch flashcards" });
		}
	});

	// Delete a deck and its flashcards
	router.delete("/:deckId", authenticateToken, async (req, res) => {
		const { deckId } = req.params;
		try {
			// Verify ownership before deletion
			const ownership = await verifyDeckOwnership(deckId, req.user.accountId);
			if (!ownership.exists) {
				return res.status(404).json({ error: "Deck not found" });
			}
			if (!ownership.isOwner) {
				return res.status(403).json({ error: "Access denied" });
			}

			// Start a transaction to ensure both operations complete or none do
			await pool.query("BEGIN");

			// First delete all flashcards in the deck
			await pool.query("DELETE FROM flashcard WHERE deck_id = $1", [deckId]);

			// Then delete the deck itself
			const result = await pool.query(
				"DELETE FROM deck WHERE id = $1 RETURNING *",
				[deckId],
			);

			// Commit the transaction
			await pool.query("COMMIT");

			res.json({
				message: "Deck and its flashcards deleted successfully",
				deck: result.rows[0],
			});
		} catch (err) {
			// If there's an error, rollback the transaction
			await pool.query("ROLLBACK");
			res.status(500).json({ error: "Failed to delete deck" });
		}
	});

	return router;
};
