const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const isAdmin = require("../middleware/isAdmin");

module.exports = function (pool) {
	const router = express.Router();

	// All admin routes require authentication AND admin role
	router.use(authenticateToken);
	router.use(isAdmin);

	/**
	 * GET /admin/users
	 * List all users with their plan information
	 * Query params: search (optional), page (default 1), limit (default 20)
	 */
	router.get("/users", async (req, res) => {
		try {
			const { search, page = 1, limit = 20 } = req.query;
			const offset = (parseInt(page) - 1) * parseInt(limit);

			let queryText = `
				SELECT 
					a.id,
					a.email,
					a.display_name,
					a.photo_url,
					a.role,
					a.created_at,
					a.last_login_date,
					p.code as plan_code,
					p.name as plan_name,
					ap.started_at as plan_started_at,
					ap.ends_at as plan_ends_at,
					ap.is_active as plan_is_active,
					(SELECT COUNT(*) FROM deck WHERE account_id = a.id) as deck_count,
					(SELECT COUNT(*) FROM flashcard f 
					 JOIN deck d ON f.deck_id = d.id 
					 WHERE d.account_id = a.id) as flashcard_count
				FROM account a
				LEFT JOIN account_plan ap ON a.id = ap.account_id
				LEFT JOIN plan p ON ap.plan_id = p.id
			`;

			const queryParams = [];
			let paramIndex = 1;

			// Add search filter if provided
			if (search) {
				queryText += ` WHERE (a.email ILIKE $${paramIndex} OR a.display_name ILIKE $${paramIndex})`;
				queryParams.push(`%${search}%`);
				paramIndex++;
			}

			// Get total count for pagination
			const countQuery = `SELECT COUNT(*) FROM account a ${search ? `WHERE (a.email ILIKE $1 OR a.display_name ILIKE $1)` : ""}`;
			const countResult = await pool.query(
				countQuery,
				search ? [`%${search}%`] : [],
			);
			const totalUsers = parseInt(countResult.rows[0].count);

			// Add ordering and pagination
			queryText += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
			queryParams.push(parseInt(limit), offset);

			const result = await pool.query(queryText, queryParams);

			res.json({
				users: result.rows,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					totalUsers,
					totalPages: Math.ceil(totalUsers / parseInt(limit)),
				},
			});
		} catch (err) {
			console.error("Error fetching users:", err);
			res.status(500).json({ error: "Failed to fetch users" });
		}
	});

	/**
	 * GET /admin/users/:userId
	 * Get detailed information about a specific user
	 */
	router.get("/users/:userId", async (req, res) => {
		try {
			const { userId } = req.params;

			const result = await pool.query(
				`
				SELECT 
					a.id,
					a.email,
					a.display_name,
					a.photo_url,
					a.role,
					a.created_at,
					a.last_login_date,
					p.id as plan_id,
					p.code as plan_code,
					p.name as plan_name,
					p.max_decks,
					p.max_flashcards,
					p.advanced_stats,
					p.has_ads,
					ap.started_at as plan_started_at,
					ap.ends_at as plan_ends_at,
					ap.is_active as plan_is_active,
					(SELECT COUNT(*) FROM deck WHERE account_id = a.id) as deck_count,
					(SELECT COUNT(*) FROM flashcard f 
					 JOIN deck d ON f.deck_id = d.id 
					 WHERE d.account_id = a.id) as flashcard_count
				FROM account a
				LEFT JOIN account_plan ap ON a.id = ap.account_id
				LEFT JOIN plan p ON ap.plan_id = p.id
				WHERE a.id = $1
			`,
				[userId],
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			// Get plan history
			const historyResult = await pool.query(
				`
				SELECT 
					aph.id,
					p.code as plan_code,
					p.name as plan_name,
					aph.started_at,
					aph.ended_at,
					aph.change_reason,
					aph.created_at
				FROM account_plan_history aph
				JOIN plan p ON aph.plan_id = p.id
				WHERE aph.account_id = $1
				ORDER BY aph.created_at DESC
				LIMIT 10
			`,
				[userId],
			);

			res.json({
				user: result.rows[0],
				planHistory: historyResult.rows,
			});
		} catch (err) {
			console.error("Error fetching user details:", err);
			res.status(500).json({ error: "Failed to fetch user details" });
		}
	});

	/**
	 * PUT /admin/users/:userId/plan
	 * Change a user's plan
	 * Body: { planCode: 'free' | 'pro' | 'premium', reason?: string }
	 */
	router.put("/users/:userId/plan", async (req, res) => {
		const client = await pool.connect();

		try {
			const { userId } = req.params;
			const { planCode, reason = "admin_change" } = req.body;

			if (!planCode) {
				return res.status(400).json({ error: "planCode is required" });
			}

			await client.query("BEGIN");

			// Check if user exists
			const userResult = await client.query(
				"SELECT id FROM account WHERE id = $1",
				[userId],
			);

			if (userResult.rows.length === 0) {
				await client.query("ROLLBACK");
				return res.status(404).json({ error: "User not found" });
			}

			// Get the new plan
			const planResult = await client.query(
				"SELECT id, code, name FROM plan WHERE code = $1",
				[planCode],
			);

			if (planResult.rows.length === 0) {
				await client.query("ROLLBACK");
				return res.status(400).json({ error: "Invalid plan code" });
			}

			const newPlan = planResult.rows[0];

			// Get current plan for history
			const currentPlanResult = await client.query(
				`SELECT ap.plan_id, ap.started_at, p.code as plan_code
				 FROM account_plan ap
				 JOIN plan p ON ap.plan_id = p.id
				 WHERE ap.account_id = $1`,
				[userId],
			);

			// If there's a current plan, add to history
			if (currentPlanResult.rows.length > 0) {
				const currentPlan = currentPlanResult.rows[0];

				// Don't do anything if it's the same plan
				if (currentPlan.plan_code === planCode) {
					await client.query("ROLLBACK");
					return res.status(400).json({ error: "User already has this plan" });
				}

				// Add current plan to history
				await client.query(
					`INSERT INTO account_plan_history 
					 (account_id, plan_id, started_at, ended_at, change_reason)
					 VALUES ($1, $2, $3, NOW(), $4)`,
					[userId, currentPlan.plan_id, currentPlan.started_at, reason],
				);

				// Update account_plan
				await client.query(
					`UPDATE account_plan 
					 SET plan_id = $1, started_at = NOW(), ends_at = NULL, is_active = TRUE, updated_at = NOW()
					 WHERE account_id = $2`,
					[newPlan.id, userId],
				);
			} else {
				// No current plan, insert new one
				await client.query(
					`INSERT INTO account_plan (account_id, plan_id, started_at, is_active)
					 VALUES ($1, $2, NOW(), TRUE)
					 ON CONFLICT (account_id) DO UPDATE
					 SET plan_id = $2, started_at = NOW(), is_active = TRUE, updated_at = NOW()`,
					[userId, newPlan.id],
				);
			}

			await client.query("COMMIT");

			// Log the admin action
			console.log(
				`[Admin] User ${req.user.email} changed plan for account ${userId} to ${planCode} (reason: ${reason})`,
			);

			res.json({
				success: true,
				message: `Plan changed to ${newPlan.name}`,
				newPlan: {
					code: newPlan.code,
					name: newPlan.name,
				},
			});
		} catch (err) {
			await client.query("ROLLBACK");
			console.error("Error changing user plan:", err);
			res.status(500).json({ error: "Failed to change user plan" });
		} finally {
			client.release();
		}
	});

	/**
	 * GET /admin/plans
	 * List all available plans
	 */
	router.get("/plans", async (req, res) => {
		try {
			const result = await pool.query(`
				SELECT 
					id, code, name, description, 
					price_monthly, max_decks, max_flashcards, 
					advanced_stats, has_ads
				FROM plan
				ORDER BY price_monthly ASC
			`);

			res.json({ plans: result.rows });
		} catch (err) {
			console.error("Error fetching plans:", err);
			res.status(500).json({ error: "Failed to fetch plans" });
		}
	});

	/**
	 * GET /admin/stats
	 * Get admin dashboard statistics
	 */
	router.get("/stats", async (req, res) => {
		try {
			const [usersCount, decksCount, flashcardsCount, planStats] =
				await Promise.all([
					pool.query("SELECT COUNT(*) FROM account"),
					pool.query("SELECT COUNT(*) FROM deck"),
					pool.query("SELECT COUNT(*) FROM flashcard"),
					pool.query(`
					SELECT p.code, p.name, COUNT(ap.account_id) as user_count
					FROM plan p
					LEFT JOIN account_plan ap ON p.id = ap.plan_id AND ap.is_active = TRUE
					GROUP BY p.id, p.code, p.name
					ORDER BY p.price_monthly ASC
				`),
				]);

			res.json({
				totalUsers: parseInt(usersCount.rows[0].count),
				totalDecks: parseInt(decksCount.rows[0].count),
				totalFlashcards: parseInt(flashcardsCount.rows[0].count),
				planDistribution: planStats.rows,
			});
		} catch (err) {
			console.error("Error fetching admin stats:", err);
			res.status(500).json({ error: "Failed to fetch statistics" });
		}
	});

	return router;
};
