const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const googlePlayService = require("../services/googlePlayService");
const {
	resolveTargetPlanCode,
	applyPlanTransition,
	upsertPlanSubscription,
	normalizeSubscriptionState,
} = require("../services/subscriptionSyncService");

module.exports = (pool) => {
	const router = express.Router();

	// Account profile endpoint
	router.get("/profile", authenticateToken, async (req, res) => {
		try {
			const accountId = req.user.accountId; // By token
			const result = await pool.query(
				"SELECT * FROM account_preferences WHERE account_id = $1",
				[accountId],
			);
			if (result.rows.length === 0)
				return res.status(404).json({ error: "Profile not found" });
			res.json({ profile: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to fetch account profile" });
		}
	});

	// Update language
	router.put("/profile/language", authenticateToken, async (req, res) => {
		const { language } = req.body;
		const accountId = req.user.accountId;
		if (!language)
			return res.status(400).json({ error: "Language is required" });
		try {
			await pool.query(
				"UPDATE account_preferences SET language = $1, updated_at = CURRENT_TIMESTAMP WHERE account_id = $2",
				[language, accountId],
			);
			res.json({ success: true, language });
		} catch (err) {
			res.status(500).json({ error: "Failed to update language" });
		}
	});

	// Update theme_preference
	router.put("/profile/theme", authenticateToken, async (req, res) => {
		const { theme_preference } = req.body;
		const accountId = req.user.accountId;
		if (!theme_preference)
			return res.status(400).json({ error: "Theme preference is required" });
		try {
			await pool.query(
				"UPDATE account_preferences SET theme_preference = $1, updated_at = CURRENT_TIMESTAMP WHERE account_id = $2",
				[theme_preference, accountId],
			);
			res.json({ success: true, theme_preference });
		} catch (err) {
			res.status(500).json({ error: "Failed to update theme preference" });
		}
	});

	// Update sound_effects_enabled
	router.put("/profile/sound", authenticateToken, async (req, res) => {
		const { sound_effects_enabled } = req.body;
		const accountId = req.user.accountId;
		if (typeof sound_effects_enabled !== "boolean")
			return res
				.status(400)
				.json({ error: "sound_effects_enabled is required" });
		try {
			await pool.query(
				"UPDATE account_preferences SET sound_effects_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE account_id = $2",
				[sound_effects_enabled, accountId],
			);
			res.json({ success: true, sound_effects_enabled });
		} catch (err) {
			res
				.status(500)
				.json({ error: "Failed to update sound effects preference" });
			console.error(err);
		}
	});

	// Update keyboard_shortcuts_enabled
	router.put("/profile/keyboard", authenticateToken, async (req, res) => {
		const { keyboard_shortcuts_enabled } = req.body;
		const accountId = req.user.accountId;
		if (typeof keyboard_shortcuts_enabled !== "boolean")
			return res
				.status(400)
				.json({ error: "keyboard_shortcuts_enabled is required" });
		try {
			await pool.query(
				"UPDATE account_preferences SET keyboard_shortcuts_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE account_id = $2",
				[keyboard_shortcuts_enabled, accountId],
			);
			res.json({ success: true, keyboard_shortcuts_enabled });
		} catch (err) {
			res
				.status(500)
				.json({ error: "Failed to update keyboard shortcuts preference" });
		}
	});

	// Account stats endpoint
	router.get("/stats", authenticateToken, async (req, res) => {
		try {
			const result = await pool.query(
				"SELECT * FROM account_daily_stats WHERE account_id = $1",
				[req.user.accountId],
			);
			if (result.rows.length === 0)
				return res.status(404).json({ error: "Stats not found" });
			res.json({ stats: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to fetch account stats" });
		}
	});

	// Get all plans (public — no auth required)
	router.get("/plans", async (req, res) => {
		try {
			const result = await pool.query(
				"SELECT id, code, name, description, price_monthly, max_decks, max_flashcards, advanced_stats FROM plan ORDER BY price_monthly ASC",
			);
			res.json({ plans: result.rows });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch plans" });
		}
	});

	// Get current user's plan
	router.get("/my-plan", authenticateToken, async (req, res) => {
		try {
			const accountId = req.user.accountId;
			const result = await pool.query(
				`SELECT ap.*, p.code, p.name, p.description, p.price_monthly, p.max_decks, p.max_flashcards, p.advanced_stats, p.has_ads
				 FROM account_plan ap
				 JOIN plan p ON ap.plan_id = p.id
				 WHERE ap.account_id = $1 AND ap.is_active = TRUE`,
				[accountId],
			);
			if (result.rows.length === 0) {
				// If no plan found, assign free plan
				const freePlan = await pool.query(
					"SELECT * FROM plan WHERE code = 'free'",
				);
				return res.json({
					plan: {
						...(freePlan.rows[0] || null),
						currentPeriodEnd: null,
						autoRenewing: false,
						subscriptionState: null,
					},
					hasActivePlan: false,
				});
			}

			const activePlan = result.rows[0];
			let currentPeriodEnd = activePlan.ends_at || null;
			let autoRenewing = false;
			let subscriptionState = null;

			try {
				const subResult = await pool.query(
					`SELECT expires_at, auto_renewing, subscription_state
					 FROM plan_subscription
					 WHERE account_id = $1
					 ORDER BY updated_at DESC
					 LIMIT 1`,
					[accountId],
				);

				if (subResult.rows.length > 0) {
					const sub = subResult.rows[0];
					currentPeriodEnd = sub.expires_at || currentPeriodEnd;
					autoRenewing = Boolean(sub.auto_renewing);
					subscriptionState = sub.subscription_state || null;
				}
			} catch (subErr) {
				// plan_subscription table may not exist yet in older deployments.
				if (subErr?.code !== "42P01") {
					console.error("Error reading subscription info:", subErr);
				}
			}

			res.json({
				plan: {
					...activePlan,
					currentPeriodEnd,
					autoRenewing,
					subscriptionState,
				},
				hasActivePlan: true,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch user plan" });
		}
	});

	// Get user's limit status (deck/flashcard counts vs plan limits)
	router.get("/limit-status", authenticateToken, async (req, res) => {
		try {
			const accountId = req.user.accountId;

			// Get user's plan
			const planResult = await pool.query(
				`SELECT p.code, p.max_decks, p.max_flashcards, p.advanced_stats, p.has_ads
				 FROM account_plan ap
				 JOIN plan p ON ap.plan_id = p.id
				 WHERE ap.account_id = $1 AND ap.is_active = TRUE`,
				[accountId],
			);

			let plan;
			if (planResult.rows.length === 0) {
				// Default to free plan
				const freePlan = await pool.query(
					"SELECT code, max_decks, max_flashcards, advanced_stats, has_ads FROM plan WHERE code = 'free'",
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

			// Get total flashcard count across all decks
			const flashcardCountResult = await pool.query(
				`SELECT COUNT(*) as count FROM flashcard f 
				 JOIN deck d ON f.deck_id = d.id 
				 WHERE d.account_id = $1`,
				[accountId],
			);
			const currentFlashcards = parseInt(flashcardCountResult.rows[0].count);

			// Calculate limits and overages
			const maxDecks = plan.max_decks; // null means unlimited
			const maxFlashcards = plan.max_flashcards; // null means unlimited

			const deckOverage =
				maxDecks !== null ? Math.max(0, currentDecks - maxDecks) : 0;
			const flashcardOverage =
				maxFlashcards !== null
					? Math.max(0, currentFlashcards - maxFlashcards)
					: 0;

			const canPlay = deckOverage === 0 && flashcardOverage === 0;
			const canCreateDeck = maxDecks === null || currentDecks < maxDecks;
			const canCreateFlashcard =
				maxFlashcards === null || currentFlashcards < maxFlashcards;

			res.json({
				planCode: plan.code,
				currentDecks,
				currentFlashcards,
				maxDecks,
				maxFlashcards,
				deckOverage,
				flashcardOverage,
				canPlay,
				canCreateDeck,
				canCreateFlashcard,
				advancedStats: plan.advanced_stats,
				hasAds: plan.has_ads,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch limit status" });
		}
	});

	/**
	 * Verify subscription purchase and sync user's plan.
	 */
	router.post("/subscriptions/verify", authenticateToken, async (req, res) => {
		const client = await pool.connect();

		try {
			const accountId = req.user.accountId;
			const {
				platform = "google_play",
				productId,
				purchaseToken,
				rawPayload,
			} = req.body || {};

			if (platform !== "google_play") {
				return res
					.status(400)
					.json({
						error: "Unsupported platform",
						code: "UNSUPPORTED_PLATFORM",
					});
			}

			if (!productId || !purchaseToken) {
				return res.status(400).json({
					error: "productId and purchaseToken are required",
					code: "MISSING_PURCHASE_FIELDS",
				});
			}

			const verifyDisabled = process.env.GOOGLE_PLAY_VERIFY_DISABLED === "true";
			const isProduction = process.env.NODE_ENV === "production";
			const googleVerifyConfigured = Boolean(
				process.env.GOOGLE_PLAY_PACKAGE_NAME &&
				process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON,
			);
			const shouldUseFallbackVerify = verifyDisabled || !googleVerifyConfigured;
			let verification;

			if (!verifyDisabled && isProduction && !googleVerifyConfigured) {
				return res.status(500).json({
					error:
						"Google Play verification is not configured. Set GOOGLE_PLAY_PACKAGE_NAME and GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.",
					code: "GOOGLE_VERIFY_NOT_CONFIGURED",
				});
			}

			if (shouldUseFallbackVerify) {
				if (!verifyDisabled && !googleVerifyConfigured) {
					console.warn(
						"[Subscriptions] Google Play verification config missing; using fallback verification in non-production.",
					);
				}

				const {
					subscriptionState = "active",
					autoRenewing = true,
					currentPeriodEnd = null,
				} = req.body || {};

				verification = {
					productId,
					purchaseToken,
					subscriptionState,
					autoRenewing,
					currentPeriodEnd,
					rawPayload: rawPayload || { source: "verify_disabled" },
				};
			} else {
				verification = await googlePlayService.verifySubscription({
					packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME,
					productId,
					purchaseToken,
				});
			}

			const normalizedState = normalizeSubscriptionState(
				verification.subscriptionState,
			);

			const parsedPeriodEnd = verification.currentPeriodEnd
				? new Date(verification.currentPeriodEnd)
				: null;
			if (parsedPeriodEnd && Number.isNaN(parsedPeriodEnd.getTime())) {
				return res
					.status(400)
					.json({
						error: "Invalid currentPeriodEnd",
						code: "INVALID_PERIOD_END",
					});
			}

			const effectivePeriodEnd = parsedPeriodEnd
				? parsedPeriodEnd.toISOString()
				: null;

			const targetPlanCode = resolveTargetPlanCode(
				verification.productId,
				normalizedState,
				effectivePeriodEnd,
			);
			if (!targetPlanCode) {
				return res
					.status(400)
					.json({ error: "Unknown productId", code: "UNKNOWN_PRODUCT_ID" });
			}

			await client.query("BEGIN");

			await upsertPlanSubscription(client, {
				accountId,
				platform,
				productId: verification.productId,
				purchaseToken: verification.purchaseToken,
				subscriptionState: normalizedState,
				currentPeriodEnd: effectivePeriodEnd,
				autoRenewing: verification.autoRenewing,
				rawPayload: verification.rawPayload || rawPayload || null,
			});

			const targetPlan = await applyPlanTransition(
				client,
				accountId,
				targetPlanCode,
				`google_play_${normalizedState}`,
				effectivePeriodEnd,
			);

			await client.query("COMMIT");

			res.json({
				success: true,
				plan: {
					code: targetPlan.code,
					name: targetPlan.name,
					currentPeriodEnd: effectivePeriodEnd,
					autoRenewing: Boolean(verification.autoRenewing),
					subscriptionState: normalizedState,
				},
			});
		} catch (err) {
			await client.query("ROLLBACK");
			console.error("Error verifying subscription:", err);
			res.status(500).json({
				error: "Failed to verify subscription",
				code: "SUBSCRIPTION_VERIFY_FAILED",
			});
		} finally {
			client.release();
		}
	});

	// Get current user info including role
	router.get("/me", authenticateToken, async (req, res) => {
		try {
			const accountId = req.user.accountId;
			const result = await pool.query(
				"SELECT id, email, display_name, photo_url, role, created_at FROM account WHERE id = $1",
				[accountId],
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "Account not found" });
			}

			res.json({ account: result.rows[0] });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch account info" });
		}
	});

	return router;
};
