const express = require("express");
const authenticateToken = require("./middleware/authenticateToken");

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

	// Get all plans
	router.get("/plans", authenticateToken, async (req, res) => {
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
				`SELECT ap.*, p.code, p.name, p.description, p.price_monthly, p.max_decks, p.max_flashcards, p.advanced_stats
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
					plan: freePlan.rows[0] || null,
					hasActivePlan: false,
				});
			}
			res.json({ plan: result.rows[0], hasActivePlan: true });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to fetch user plan" });
		}
	});

	return router;
};
