const express = require("express");
const authenticateToken = require("./middleware/authenticateToken");

/**
 * Firebase Authentication Routes
 *
 * Unlike the old JWT-based auth, Firebase handles user creation and authentication.
 * This module only handles syncing Firebase users with our database.
 */
module.exports = (pool) => {
	const router = express.Router();

	/**
	 * Sync Firebase user with database
	 * Called after successful Firebase authentication to create/update local account
	 *
	 * POST /auth/sync
	 * Headers: Authorization: Bearer <firebase-id-token>
	 * Body: { displayName?: string }
	 */
	router.post("/sync", authenticateToken, async (req, res) => {
		const { uid, email, displayName, photoURL } = req.firebaseUser;
		const { displayName: providedDisplayName } = req.body;

		const finalDisplayName =
			providedDisplayName || displayName || email?.split("@")[0] || "User";

		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			// Check if account already exists by firebase_uid
			let existingAccount = await client.query(
				"SELECT id FROM account WHERE firebase_uid = $1",
				[uid],
			);

			let accountId;
			let isNewUser = false;

			if (existingAccount.rows.length > 0) {
				// Update existing account (already linked to Firebase)
				accountId = existingAccount.rows[0].id;
				await client.query(
					`UPDATE account 
					 SET email = $1, display_name = $2, photo_url = $3, last_login_date = CURRENT_TIMESTAMP 
					 WHERE firebase_uid = $4`,
					[email, finalDisplayName, photoURL, uid],
				);
			} else {
				// Check if account exists by email (migration from old auth system)
				const existingByEmail = await client.query(
					"SELECT id, firebase_uid FROM account WHERE email = $1",
					[email],
				);

				if (existingByEmail.rows.length > 0) {
					// Link existing account to Firebase (migration case)
					accountId = existingByEmail.rows[0].id;
					await client.query(
						`UPDATE account 
						 SET firebase_uid = $1, display_name = $2, photo_url = $3, last_login_date = CURRENT_TIMESTAMP 
						 WHERE id = $4`,
						[uid, finalDisplayName, photoURL, accountId],
					);
				} else {
					// Create new account
					isNewUser = true;
					const accountResult = await client.query(
						`INSERT INTO account (firebase_uid, email, display_name, photo_url, last_login_date) 
						 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
						 RETURNING id`,
						[uid, email, finalDisplayName, photoURL],
					);
					accountId = accountResult.rows[0].id;

					// Create default account_preferences
					await client.query(
						"INSERT INTO account_preferences (account_id) VALUES ($1)",
						[accountId],
					);

					// Get free plan id and assign it
					const freePlanResult = await client.query(
						"SELECT id FROM plan WHERE code = 'free'",
					);
					const freePlanId = freePlanResult.rows[0]?.id || 1;

					// Create account_plan (assign free plan)
					await client.query(
						`INSERT INTO account_plan (account_id, plan_id, started_at, is_active) 
						 VALUES ($1, $2, CURRENT_TIMESTAMP, TRUE)`,
						[accountId, freePlanId],
					);

					// Create account_plan_history entry
					await client.query(
						`INSERT INTO account_plan_history (account_id, plan_id, started_at, change_reason) 
						 VALUES ($1, $2, CURRENT_TIMESTAMP, 'signup')`,
						[accountId, freePlanId],
					);
				}
			}

			await client.query("COMMIT");

			res.json({
				success: true,
				accountId,
				isNewUser,
				message: isNewUser
					? "Account created successfully"
					: "Account synced successfully",
			});
		} catch (err) {
			await client.query("ROLLBACK");
			console.error("Sync error:", err);

			if (err.code === "23505") {
				// Unique constraint violation - email already exists
				return res
					.status(409)
					.json({ error: "Email already associated with another account" });
			}

			res.status(500).json({ error: "Failed to sync account" });
		} finally {
			client.release();
		}
	});

	/**
	 * Get current user info
	 *
	 * GET /auth/me
	 * Headers: Authorization: Bearer <firebase-id-token>
	 */
	router.get("/me", authenticateToken, async (req, res) => {
		if (req.user.needsSync) {
			return res.status(200).json({
				needsSync: true,
				firebaseUser: req.firebaseUser,
			});
		}

		try {
			const result = await pool.query(
				`SELECT a.id, a.email, a.display_name, a.photo_url, a.created_at,
				        ap.language, ap.theme_preference, ap.sound_effects_enabled,
				        p.code as plan_code, p.name as plan_name
				 FROM account a
				 LEFT JOIN account_preferences ap ON a.id = ap.account_id
				 LEFT JOIN account_plan apl ON a.id = apl.account_id AND apl.is_active = TRUE
				 LEFT JOIN plan p ON apl.plan_id = p.id
				 WHERE a.id = $1`,
				[req.user.accountId],
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "Account not found" });
			}

			const account = result.rows[0];
			res.json({
				accountId: account.id,
				email: account.email,
				displayName: account.display_name,
				photoURL: account.photo_url,
				createdAt: account.created_at,
				preferences: {
					language: account.language,
					themePreference: account.theme_preference,
					soundEffectsEnabled: account.sound_effects_enabled,
				},
				plan: {
					code: account.plan_code,
					name: account.plan_name,
				},
			});
		} catch (err) {
			console.error("Get user error:", err);
			res.status(500).json({ error: "Failed to get user info" });
		}
	});

	/**
	 * Delete account and all related data
	 * Note: This deletes the database record and all associated data.
	 * Firebase account should be deleted from the client side.
	 *
	 * DELETE /auth/account
	 * Headers: Authorization: Bearer <firebase-id-token>
	 */
	router.delete("/account", authenticateToken, async (req, res) => {
		if (!req.user.accountId) {
			return res.status(404).json({ error: "Account not found" });
		}

		const client = await pool.connect();
		try {
			await client.query("BEGIN");

			const accountId = req.user.accountId;

			// Delete flashcards (through decks)
			await client.query(
				`DELETE FROM flashcard WHERE deck_id IN (SELECT id FROM deck WHERE account_id = $1)`,
				[accountId],
			);

			// Delete decks
			await client.query("DELETE FROM deck WHERE account_id = $1", [accountId]);

			// Delete study sessions
			await client.query("DELETE FROM study_session WHERE account_id = $1", [
				accountId,
			]);

			// Delete account achievements
			await client.query(
				"DELETE FROM account_achievements WHERE account_id = $1",
				[accountId],
			);

			// Delete account preferences
			await client.query(
				"DELETE FROM account_preferences WHERE account_id = $1",
				[accountId],
			);

			// Delete account plan history
			await client.query(
				"DELETE FROM account_plan_history WHERE account_id = $1",
				[accountId],
			);

			// Delete account plan
			await client.query("DELETE FROM account_plan WHERE account_id = $1", [
				accountId,
			]);

			// Finally delete the account
			await client.query("DELETE FROM account WHERE id = $1", [accountId]);

			await client.query("COMMIT");

			res.json({
				success: true,
				message: "Account and all data deleted successfully",
			});
		} catch (err) {
			await client.query("ROLLBACK");
			console.error("Delete account error:", err);
			res.status(500).json({ error: "Failed to delete account" });
		} finally {
			client.release();
		}
	});

	return router;
};
