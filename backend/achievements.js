const express = require("express");
const authenticateToken = require("./middleware/authenticateToken");

module.exports = (pool) => {
	const router = express.Router();

	// Get all achievements with user's earned status
	router.get("/", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;

		try {
			const result = await pool.query(
				`SELECT 
					a.id,
					a.name,
					a.description,
					a.icon,
					a.category,
					a.threshold,
					COALESCE(aa.done_count, 0) as done_count,
					aa.earned_at,
					CASE WHEN aa.account_id IS NOT NULL THEN true ELSE false END as earned
				FROM achievement a
				LEFT JOIN account_achievements aa 
					ON a.id = aa.achievement_id AND aa.account_id = $1
				ORDER BY a.category, a.threshold`,
				[accountId]
			);

			res.json({ achievements: result.rows });
		} catch (error) {
			console.error("Error fetching achievements:", error);
			res.status(500).json({ error: "Error fetching achievements" });
		}
	});

	// Check and award achievements after game completion
	router.post("/check", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		const { accuracy, cardsStudied } = req.body;

		console.log("[Achievements] Check request:", {
			accountId,
			accuracy,
			cardsStudied,
		});

		try {
			const newlyEarned = [];

			// 1. Check STREAK achievements (consecutive days with study sessions)
			const streakResult = await pool.query(
				`WITH daily_sessions AS (
					SELECT DISTINCT DATE(session_date) as study_date
					FROM study_session
					WHERE account_id = $1
					ORDER BY study_date DESC
				),
				streak_calc AS (
					SELECT 
						study_date,
						study_date - (ROW_NUMBER() OVER (ORDER BY study_date DESC))::int as grp
					FROM daily_sessions
				)
				SELECT COUNT(*) as streak_length
				FROM streak_calc
				WHERE grp = (
					SELECT grp FROM streak_calc WHERE study_date = CURRENT_DATE
				)`,
				[accountId]
			);

			const currentStreak = parseInt(streakResult.rows[0]?.streak_length || 0);

			// Check streak achievements
			const streakThresholds = [3, 7, 14, 30];
			for (const threshold of streakThresholds) {
				if (currentStreak >= threshold) {
					const earned = await awardAchievement(
						pool,
						accountId,
						"streak",
						threshold
					);
					if (earned) newlyEarned.push(earned);
				}
			}

			// 2. Check ACCURACY achievements - only award the highest threshold reached
			if (accuracy !== undefined && accuracy !== null) {
				console.log("[Achievements] Checking accuracy:", accuracy);
				const accuracyThresholds = [100, 90, 80]; // Check from highest to lowest
				for (const threshold of accuracyThresholds) {
					console.log(
						"[Achievements] Testing threshold:",
						threshold,
						"accuracy >= threshold:",
						accuracy >= threshold
					);
					if (accuracy >= threshold) {
						const earned = await awardAchievement(
							pool,
							accountId,
							"accuracy",
							threshold
						);
						console.log(
							"[Achievements] Award result for",
							threshold,
							":",
							earned
						);
						if (earned) newlyEarned.push(earned);
						break; // Only award the highest threshold
					}
				}
			}

			// 3. Check VOLUME achievements (total cards studied all-time)
			const volumeResult = await pool.query(
				`SELECT COALESCE(SUM(cards_studied), 0) as total_cards
				FROM study_session
				WHERE account_id = $1`,
				[accountId]
			);

			const totalCards = parseInt(volumeResult.rows[0]?.total_cards || 0);
			const volumeThresholds = [50, 100, 500, 1000];
			for (const threshold of volumeThresholds) {
				if (totalCards >= threshold) {
					const earned = await awardAchievement(
						pool,
						accountId,
						"volume",
						threshold
					);
					if (earned) newlyEarned.push(earned);
				}
			}

			res.json({ newlyEarned });
		} catch (error) {
			console.error("Error checking achievements:", error);
			res.status(500).json({ error: "Error checking achievements" });
		}
	});

	return router;
};

// Helper function to award an achievement
async function awardAchievement(pool, accountId, category, threshold) {
	try {
		// Get the achievement
		const achievementResult = await pool.query(
			`SELECT id, name, description, icon, category, threshold
			FROM achievement 
			WHERE category = $1 AND threshold = $2`,
			[category, threshold]
		);

		if (achievementResult.rows.length === 0) {
			return null;
		}

		const achievement = achievementResult.rows[0];

		// Check if already earned
		const existingResult = await pool.query(
			`SELECT done_count FROM account_achievements 
			WHERE account_id = $1 AND achievement_id = $2`,
			[accountId, achievement.id]
		);

		if (existingResult.rows.length > 0) {
			// Already earned - increment done_count for repeatable achievements
			// For accuracy achievements (can be earned multiple times)
			if (category === "accuracy") {
				await pool.query(
					`UPDATE account_achievements 
					SET done_count = done_count + 1, earned_at = CURRENT_TIMESTAMP
					WHERE account_id = $1 AND achievement_id = $2`,
					[accountId, achievement.id]
				);
				return {
					...achievement,
					done_count: existingResult.rows[0].done_count + 1,
					isRepeat: true,
				};
			}
			// Streak and volume achievements are not repeatable
			return null;
		}

		// Award the achievement
		await pool.query(
			`INSERT INTO account_achievements (account_id, achievement_id, done_count)
			VALUES ($1, $2, 1)`,
			[accountId, achievement.id]
		);

		return { ...achievement, done_count: 1, isRepeat: false };
	} catch (error) {
		console.error("Error awarding achievement:", error);
		return null;
	}
}
