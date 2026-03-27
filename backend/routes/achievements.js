const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");

module.exports = (pool) => {
	const router = express.Router();
	const DEFAULT_TIMEZONE = "UTC";

	const resolveClientTimezone = (req) => {
		const headerTimezone =
			typeof req?.headers?.["x-client-timezone"] === "string"
				? req.headers["x-client-timezone"]
				: "";
		const queryTimezone =
			typeof req?.query?.timezone === "string" ? req.query.timezone : "";
		const headerOffsetRaw =
			typeof req?.headers?.["x-client-timezone-offset-minutes"] === "string"
				? req.headers["x-client-timezone-offset-minutes"]
				: "";
		const queryOffsetRaw =
			typeof req?.query?.timezoneOffsetMinutes === "string"
				? req.query.timezoneOffsetMinutes
				: "";

		const rawTimezone = (headerTimezone || queryTimezone).trim();

		const rawOffset = (headerOffsetRaw || queryOffsetRaw).trim();
		const parsedOffset = Number.parseInt(rawOffset, 10);
		const offsetMinutes = Number.isFinite(parsedOffset) ? parsedOffset : null;

		const toOffsetTimezone = (minutes) => {
			if (!Number.isFinite(minutes)) return null;
			if (minutes < -840 || minutes > 840) return null;
			// PostgreSQL uses POSIX timezone format where + is West of UTC and - is East of UTC.
			const sign = minutes >= 0 ? "-" : "+";
			const absoluteMinutes = Math.abs(minutes);
			const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
			const mins = String(absoluteMinutes % 60).padStart(2, "0");
			return `${sign}${hours}:${mins}`;
		};

		const parseUtcGmtOffset = (timezone) => {
			const match = timezone.match(
				/^(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/i,
			);
			if (!match) return null;
			const [, sign, hoursText, minsText] = match;
			const hours = Number.parseInt(hoursText, 10);
			const mins = Number.parseInt(minsText || "0", 10);
			if (!Number.isFinite(hours) || !Number.isFinite(mins)) return null;
			if (hours > 14 || mins > 59) return null;
			const totalMinutes = hours * 60 + mins;
			const signedMinutes = sign === "+" ? totalMinutes : -totalMinutes;
			return toOffsetTimezone(signedMinutes);
		};

		if (rawTimezone) {
			try {
				new Intl.DateTimeFormat("en-US", { timeZone: rawTimezone });
				if (rawTimezone === "UTC" && offsetMinutes && offsetMinutes !== 0) {
					return toOffsetTimezone(offsetMinutes) || DEFAULT_TIMEZONE;
				}
				return rawTimezone;
			} catch {
				const utcGmtOffsetTimezone = parseUtcGmtOffset(rawTimezone);
				if (utcGmtOffsetTimezone) return utcGmtOffsetTimezone;
			}
		}

		return toOffsetTimezone(offsetMinutes) || DEFAULT_TIMEZONE;
	};

	// One-time cleanup: remove duplicate achievement rows (keep the one with the lowest id)
	(async () => {
		try {
			if (process.env.ENABLE_ACHIEVEMENT_RECONCILIATION === "false") {
				console.log("[Achievements] Skipping duplicate cleanup in production");
				return;
			}
			// Re-point account_achievements to the canonical (min id) achievement before deleting duplicates
			await pool.query(`
				UPDATE account_achievements aa
				SET achievement_id = canonical.min_id
				FROM (
					SELECT category, threshold, MIN(id) AS min_id
					FROM achievement
					GROUP BY category, threshold
				) canonical
				JOIN achievement a ON a.category = canonical.category
				  AND a.threshold = canonical.threshold
				  AND a.id != canonical.min_id
				WHERE aa.achievement_id = a.id
				  AND NOT EXISTS (
				    SELECT 1 FROM account_achievements ex
				    WHERE ex.account_id = aa.account_id AND ex.achievement_id = canonical.min_id
				  )
			`);
			// Delete orphaned account_achievements that now conflict
			await pool.query(`
				DELETE FROM account_achievements
				WHERE achievement_id NOT IN (
					SELECT MIN(id) FROM achievement GROUP BY category, threshold
				)
			`);
			// Delete duplicate achievement rows
			const delResult = await pool.query(`
				DELETE FROM achievement
				WHERE id NOT IN (
					SELECT MIN(id) FROM achievement GROUP BY category, threshold
				)
			`);
			if (delResult.rowCount > 0) {
				console.log(
					`[Achievements] Cleaned ${delResult.rowCount} duplicate achievement rows`,
				);
			}
			// Add unique constraint if missing
			await pool.query(`
				DO $$
				BEGIN
					IF NOT EXISTS (
						SELECT 1 FROM pg_constraint WHERE conname = 'achievement_category_threshold_key'
					) THEN
						ALTER TABLE achievement ADD CONSTRAINT achievement_category_threshold_key UNIQUE (category, threshold);
					END IF;
				END $$;
			`);
		} catch (err) {
			console.error(
				"[Achievements] Error cleaning duplicate achievements:",
				err,
			);
		}
	})();

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
				[accountId],
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
		const clientTimezone = resolveClientTimezone(req);
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
					SELECT DISTINCT DATE(timezone($2, session_date)) as study_date
					FROM study_session
					WHERE account_id = $1
					ORDER BY study_date DESC
				),
				streak_calc AS (
					SELECT 
						study_date,
						-- Use addition with row number so consecutive descending dates produce the same grp value
						study_date + (ROW_NUMBER() OVER (ORDER BY study_date DESC))::int as grp
					FROM daily_sessions
				)
				SELECT COUNT(*) as streak_length
				FROM streak_calc
				WHERE grp = (
					SELECT grp FROM streak_calc WHERE study_date = DATE(timezone($2, NOW()))
				)`,
				[accountId, clientTimezone],
			);

			const currentStreak = parseInt(streakResult.rows[0]?.streak_length || 0);

			console.log("[Achievements] Current streak:", currentStreak);

			// Check streak achievements — only award when streak exactly hits a threshold
			const streakThresholds = [3, 7, 14, 30, 90, 180, 365];
			for (const threshold of streakThresholds) {
				if (currentStreak === threshold) {
					const earned = await awardAchievement(
						pool,
						accountId,
						"streak",
						threshold,
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
						accuracy >= threshold,
					);
					if (accuracy >= threshold) {
						const earned = await awardAchievement(
							pool,
							accountId,
							"accuracy",
							threshold,
						);
						console.log(
							"[Achievements] Award result for",
							threshold,
							":",
							earned,
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
				[accountId],
			);

			const totalCards = parseInt(volumeResult.rows[0]?.total_cards || 0);
			const volumeThresholds = [
				50, 100, 500, 1000, 5000, 20000, 100000, 1000000,
			];
			for (const threshold of volumeThresholds) {
				if (totalCards >= threshold) {
					const earned = await awardAchievement(
						pool,
						accountId,
						"volume",
						threshold,
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
			WHERE category = $1 AND threshold = $2
			LIMIT 1`,
			[category, threshold],
		);

		if (achievementResult.rows.length === 0) {
			console.log(
				`[Achievements] No achievement row for category=${category} threshold=${threshold}`,
			);
			return null;
		}

		const achievement = achievementResult.rows[0];
		console.log(
			`[Achievements] Found achievement: id=${achievement.id} name=${achievement.name}`,
		);

		// Check if already earned
		const existingResult = await pool.query(
			`SELECT done_count, earned_at FROM account_achievements 
			WHERE account_id = $1 AND achievement_id = $2`,
			[accountId, achievement.id],
		);
		console.log(
			`[Achievements] existingResult.rows.length=${existingResult.rows.length} for accountId=${accountId} achievementId=${achievement.id} earned_at=${existingResult.rows[0]?.earned_at}`,
		);

		if (existingResult.rows.length > 0) {
			// Already earned: apply per-category policy
			if (category === "accuracy") {
				// For accuracy we increment done_count to track repeats and show modal
				await pool.query(
					`UPDATE account_achievements 
					SET done_count = done_count + 1, earned_at = CURRENT_TIMESTAMP
					WHERE account_id = $1 AND achievement_id = $2`,
					[accountId, achievement.id],
				);
				console.log(
					`[Achievements] Updated existing account_achievements for account ${accountId}, achievement ${achievement.id}`,
				);
				const doneCountRes = await pool.query(
					`SELECT done_count FROM account_achievements WHERE account_id = $1 AND achievement_id = $2`,
					[accountId, achievement.id],
				);
				const done_count = doneCountRes.rows[0]?.done_count || 1;
				console.log(
					`[Achievements] Returning repeat achievement object for account ${accountId}, achievement ${achievement.id} done_count=${done_count}`,
				);
				return {
					...achievement,
					done_count,
					isRepeat: true,
					alreadyEarned: true,
				};
			}

			if (category === "volume") {
				// For volume achievements, if already earned, do not show modal again
				console.log(
					`[Achievements] Account ${accountId} already has volume achievement ${achievement.id}; skipping modal`,
				);
				return null;
			}

			if (category === "streak") {
				// If the streak achievement was already earned today, skip showing it again
				const earnedAt = existingResult.rows[0]?.earned_at;
				if (earnedAt) {
					const earnedDate = new Date(earnedAt).toISOString().slice(0, 10);
					const today = new Date().toISOString().slice(0, 10);
					if (earnedDate === today) {
						console.log(
							`[Achievements] Account ${accountId} already earned streak achievement ${achievement.id} today; skipping modal`,
						);
						return null;
					}
				}
				// Update earned_at to today so subsequent games today won't show it again
				await pool.query(
					`UPDATE account_achievements 
					SET earned_at = CURRENT_TIMESTAMP
					WHERE account_id = $1 AND achievement_id = $2`,
					[accountId, achievement.id],
				);
				const done_count = existingResult.rows[0]?.done_count || 1;
				console.log(
					`[Achievements] Account ${accountId} already earned streak achievement ${achievement.id} previously; returning object for modal (done_count=${done_count})`,
				);
				return {
					...achievement,
					done_count,
					isRepeat: false,
					alreadyEarned: true,
				};
			}

			// For other categories, return the existing achievement so frontend can still show modal
			const done_count = existingResult.rows[0]?.done_count || 1;
			console.log(
				`[Achievements] Account ${accountId} already earned achievement ${achievement.id}; returning object for modal (done_count=${done_count})`,
			);
			return {
				...achievement,
				done_count,
				isRepeat: false,
				alreadyEarned: true,
			};
		}

		// Award the achievement
		try {
			const insertRes = await pool.query(
				`INSERT INTO account_achievements (account_id, achievement_id, done_count)
				VALUES ($1, $2, 1)`,
				[accountId, achievement.id],
			);
			console.log(
				`[Achievements] Inserted account_achievements for account ${accountId}, achievement ${achievement.id}`,
			);
		} catch (err) {
			// If insertion fails due to constraint, log and return null
			console.error(
				`[Achievements] Failed to insert account_achievements for account ${accountId}, achievement ${achievement.id}:`,
				err.message || err,
			);
			return null;
		}

		return { ...achievement, done_count: 1, isRepeat: false };
	} catch (error) {
		console.error("Error awarding achievement:", error);
		return null;
	}
}
