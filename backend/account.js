const express = require("express");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authenticateToken");

const bcrypt = require("bcrypt");

module.exports = (pool) => {
	const router = express.Router();

	// Account info endpoint (name and created_at)
	router.get("/me", authenticateToken, async (req, res) => {
		try {
			const result = await pool.query(
				"SELECT accountname, created_at FROM account WHERE id = $1",
				[req.user.accountId]
			);
			if (result.rows.length === 0)
				return res.status(404).json({ error: "Account not found" });
			res.json({ account: result.rows[0] });
		} catch (err) {
			res.status(500).json({ error: "Failed to fetch account info" });
		}
	});

	// Change password endpoint
	router.post("/change-password", authenticateToken, async (req, res) => {
		const { oldPassword, newPassword, newPasswordRepeat } = req.body;
		if (!oldPassword || !newPassword || !newPasswordRepeat) {
			return res.status(400).json({ error: "All fields are required" });
		}
		if (newPassword !== newPasswordRepeat) {
			return res.status(400).json({ error: "New passwords do not match" });
		}
		// Password rules (same as signup): min 8 characters, must contain letters and numbers
		if (
			newPassword.length < 8 ||
			!/[A-Za-z]/.test(newPassword) ||
			!/[0-9]/.test(newPassword)
		) {
			return res.status(400).json({
				error:
					"Password must be at least 8 characters and contain both letters and numbers",
			});
		}
		try {
			const result = await pool.query(
				"SELECT password_hash FROM account WHERE id = $1",
				[req.user.accountId]
			);
			if (result.rows.length === 0)
				return res.status(404).json({ error: "Account not found" });
			const valid = await bcrypt.compare(
				oldPassword,
				result.rows[0].password_hash
			);
			if (!valid)
				return res.status(401).json({ error: "Old password is incorrect" });
			const hash = await bcrypt.hash(newPassword, 10);
			await pool.query("UPDATE account SET password_hash = $1 WHERE id = $2", [
				hash,
				req.user.accountId,
			]);
			res.json({ success: true, message: "Password changed successfully" });
		} catch (err) {
			res.status(500).json({ error: "Failed to change password" });
		}
	});

	// Account profile endpoint
	router.get("/profile", authenticateToken, async (req, res) => {
		try {
			const accountId = req.user.accountId; // By token
			const result = await pool.query(
				"SELECT * FROM account_preferences WHERE account_id = $1",
				[accountId]
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
				[language, accountId]
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
				[theme_preference, accountId]
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
				[sound_effects_enabled, accountId]
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
				[keyboard_shortcuts_enabled, accountId]
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
				[req.user.accountId]
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
				"SELECT id, code, name, description, price_monthly, max_decks, max_flashcards, advanced_stats FROM plan ORDER BY price_monthly ASC"
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
				[accountId]
			);
			if (result.rows.length === 0) {
				// If no plan found, assign free plan
				const freePlan = await pool.query(
					"SELECT * FROM plan WHERE code = 'free'"
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

	// Delete account endpoint - deletes account and all related data (CASCADE)
	router.delete("/delete", authenticateToken, async (req, res) => {
		try {
			const accountId = req.user.accountId;

			// Delete account - all related data will be deleted due to ON DELETE CASCADE
			const result = await pool.query(
				"DELETE FROM account WHERE id = $1 RETURNING id",
				[accountId]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "Account not found" });
			}

			res.json({ success: true, message: "Account deleted successfully" });
		} catch (err) {
			console.error("Delete account error:", err);
			res.status(500).json({ error: "Failed to delete account" });
		}
	});

	return router;
};
