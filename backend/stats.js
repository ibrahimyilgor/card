const express = require("express");
const authenticateToken = require("./middleware/authenticateToken");

module.exports = (pool) => {
	const router = express.Router();

	// Get comprehensive overview stats
	router.get("/overview", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		try {
			// Total decks and cards
			const deckStats = await pool.query(
				`
                SELECT 
                    COUNT(DISTINCT d.id) as total_decks,
                    COUNT(f.id) as total_cards
                FROM deck d
                LEFT JOIN flashcard f ON d.id = f.deck_id
                WHERE d.account_id = $1
            `,
				[accountId]
			);

			// Total correct/wrong counts
			const answerStats = await pool.query(
				`
                SELECT 
                    COALESCE(SUM(f.correct_count), 0) as total_correct,
                    COALESCE(SUM(f.wrong_count), 0) as total_wrong
                FROM flashcard f
                JOIN deck d ON f.deck_id = d.id
                WHERE d.account_id = $1
            `,
				[accountId]
			);

			// Study sessions from study_session table
			const sessionStats = await pool.query(
				`
                SELECT 
                    COUNT(*) as total_sessions,
                    COALESCE(SUM(cards_studied), 0) as total_cards_studied,
                    COALESCE(SUM(correct_answers), 0) as session_correct,
                    COALESCE(SUM(wrong_answers), 0) as session_wrong,
                    COALESCE(SUM(duration_seconds), 0) as total_study_time
                FROM study_session
                WHERE account_id = $1
            `,
				[accountId]
			);

			// Current streak calculation
			const streakResult = await pool.query(
				`
                WITH dates AS (
                    SELECT DISTINCT DATE(session_date) as study_date
                    FROM study_session
                    WHERE account_id = $1
                    ORDER BY study_date DESC
                ),
                streak AS (
                    SELECT study_date,
                           study_date - (ROW_NUMBER() OVER (ORDER BY study_date DESC))::int as grp
                    FROM dates
                )
                SELECT COUNT(*) as streak_days
                FROM streak
                WHERE grp = (SELECT grp FROM streak WHERE study_date = CURRENT_DATE)
            `,
				[accountId]
			);

			// Longest streak
			const longestStreakResult = await pool.query(
				`
                WITH dates AS (
                    SELECT DISTINCT DATE(session_date) as study_date
                    FROM study_session
                    WHERE account_id = $1
                    ORDER BY study_date
                ),
                streak AS (
                    SELECT study_date,
                           study_date - (ROW_NUMBER() OVER (ORDER BY study_date))::int as grp
                    FROM dates
                )
                SELECT MAX(streak_count) as longest_streak
                FROM (
                    SELECT grp, COUNT(*) as streak_count
                    FROM streak
                    GROUP BY grp
                ) s
            `,
				[accountId]
			);

			// Best deck (highest accuracy with at least 10 answers)
			const bestDeck = await pool.query(
				`
                SELECT d.id, d.title,
                       SUM(f.correct_count) as correct,
                       SUM(f.wrong_count) as wrong,
                       CASE WHEN SUM(f.correct_count) + SUM(f.wrong_count) > 0
                            THEN ROUND(SUM(f.correct_count)::numeric / (SUM(f.correct_count) + SUM(f.wrong_count)) * 100, 1)
                            ELSE 0 END as accuracy
                FROM deck d
                JOIN flashcard f ON d.id = f.deck_id
                WHERE d.account_id = $1
                GROUP BY d.id, d.title
                HAVING SUM(f.correct_count) + SUM(f.wrong_count) >= 10
                ORDER BY accuracy DESC
                LIMIT 1
            `,
				[accountId]
			);

			// Average session duration
			const avgSession = await pool.query(
				`
                SELECT COALESCE(AVG(duration_seconds), 0) as avg_duration
                FROM study_session
                WHERE account_id = $1
            `,
				[accountId]
			);

			const totalCorrect = parseInt(answerStats.rows[0].total_correct) || 0;
			const totalWrong = parseInt(answerStats.rows[0].total_wrong) || 0;
			const totalAnswers = totalCorrect + totalWrong;
			const accuracy =
				totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

			res.json({
				totalDecks: parseInt(deckStats.rows[0].total_decks) || 0,
				totalCards: parseInt(deckStats.rows[0].total_cards) || 0,
				totalCorrect,
				totalWrong,
				accuracy,
				totalSessions: parseInt(sessionStats.rows[0].total_sessions) || 0,
				totalCardsStudied:
					parseInt(sessionStats.rows[0].total_cards_studied) || 0,
				totalStudyTime: parseInt(sessionStats.rows[0].total_study_time) || 0,
				currentStreak: parseInt(streakResult.rows[0]?.streak_days) || 0,
				longestStreak:
					parseInt(longestStreakResult.rows[0]?.longest_streak) || 0,
				bestDeck: bestDeck.rows[0] || null,
				avgSessionDuration: Math.round(
					parseFloat(avgSession.rows[0].avg_duration) || 0
				),
			});
		} catch (err) {
			console.error("Error fetching overview stats:", err);
			res.status(500).json({ error: "Failed to fetch stats" });
		}
	});

	// Get daily activity for date range (for charts)
	router.get("/daily", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		const { startDate, endDate, period } = req.query;

		try {
			let dateFilter = "";
			let params = [accountId];

			if (startDate && endDate) {
				dateFilter = "AND session_date >= $2 AND session_date <= $3";
				params.push(startDate, endDate);
			} else if (period) {
				// period: 7d, 30d, 90d, 365d, all
				const periodDays = {
					"7d": 7,
					"30d": 30,
					"90d": 90,
					"365d": 365,
				};
				if (periodDays[period]) {
					dateFilter = `AND session_date >= CURRENT_DATE - INTERVAL '${periodDays[period]} days'`;
				}
			}

			const dailyStats = await pool.query(
				`
                SELECT 
                    DATE(session_date) as date,
                    SUM(cards_studied) as cards_studied,
                    SUM(correct_answers) as correct,
                    SUM(wrong_answers) as wrong,
                    SUM(duration_seconds) as study_time,
                    COUNT(*) as sessions
                FROM study_session
                WHERE account_id = $1 ${dateFilter}
                GROUP BY DATE(session_date)
                ORDER BY date ASC
            `,
				params
			);

			res.json({ daily: dailyStats.rows });
		} catch (err) {
			console.error("Error fetching daily stats:", err);
			res.status(500).json({ error: "Failed to fetch daily stats" });
		}
	});

	// Get all decks performance
	router.get("/decks", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		try {
			const deckStats = await pool.query(
				`
                SELECT 
                    d.id,
                    d.title,
                    d.mode,
                    d.created_at,
                    COUNT(f.id) as card_count,
                    COALESCE(SUM(f.correct_count), 0) as total_correct,
                    COALESCE(SUM(f.wrong_count), 0) as total_wrong,
                    CASE WHEN COALESCE(SUM(f.correct_count), 0) + COALESCE(SUM(f.wrong_count), 0) > 0
                         THEN ROUND(SUM(f.correct_count)::numeric / (SUM(f.correct_count) + SUM(f.wrong_count)) * 100, 1)
                         ELSE 0 END as accuracy,
                    (SELECT COUNT(*) FROM study_session ss WHERE ss.deck_id = d.id) as session_count,
                    (SELECT MAX(session_date) FROM study_session ss WHERE ss.deck_id = d.id) as last_studied
                FROM deck d
                LEFT JOIN flashcard f ON d.id = f.deck_id
                WHERE d.account_id = $1
                GROUP BY d.id, d.title, d.mode, d.created_at
                ORDER BY d.title ASC
            `,
				[accountId]
			);

			res.json({ decks: deckStats.rows });
		} catch (err) {
			console.error("Error fetching deck stats:", err);
			res.status(500).json({ error: "Failed to fetch deck stats" });
		}
	});

	// Get specific deck detailed stats
	router.get("/deck/:deckId", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		const { deckId } = req.params;
		const { period } = req.query;

		try {
			// Verify ownership
			const ownership = await pool.query(
				"SELECT account_id FROM deck WHERE id = $1",
				[deckId]
			);
			if (ownership.rows.length === 0)
				return res.status(404).json({ error: "Deck not found" });
			if (ownership.rows[0].account_id !== accountId)
				return res.status(403).json({ error: "Access denied" });

			// Deck info
			const deckInfo = await pool.query(
				`
                SELECT d.*, COUNT(f.id) as card_count
                FROM deck d
                LEFT JOIN flashcard f ON d.id = f.deck_id
                WHERE d.id = $1
                GROUP BY d.id
            `,
				[deckId]
			);

			// Card stats
			const cardStats = await pool.query(
				`
                SELECT 
                    COALESCE(SUM(correct_count), 0) as total_correct,
                    COALESCE(SUM(wrong_count), 0) as total_wrong,
                    COUNT(*) FILTER (WHERE wrong_count > correct_count) as hard_cards,
                    COUNT(*) FILTER (WHERE correct_count > wrong_count) as easy_cards,
                    COUNT(*) FILTER (WHERE correct_count = 0 AND wrong_count = 0) as unstudied_cards
                FROM flashcard
                WHERE deck_id = $1
            `,
				[deckId]
			);

			// Session history
			let periodFilter = "";
			if (period) {
				const periodDays = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };
				if (periodDays[period]) {
					periodFilter = `AND session_date >= CURRENT_DATE - INTERVAL '${periodDays[period]} days'`;
				}
			}

			const sessions = await pool.query(
				`
                SELECT 
                    DATE(session_date) as date,
                    SUM(cards_studied) as cards_studied,
                    SUM(correct_answers) as correct,
                    SUM(wrong_answers) as wrong,
                    SUM(duration_seconds) as study_time,
                    game_mode
                FROM study_session
                WHERE deck_id = $1 ${periodFilter}
                GROUP BY DATE(session_date), game_mode
                ORDER BY date DESC
            `,
				[deckId]
			);

			// Mode breakdown
			const modeStats = await pool.query(
				`
                SELECT 
                    game_mode,
                    COUNT(*) as sessions,
                    SUM(cards_studied) as cards_studied,
                    SUM(correct_answers) as correct,
                    SUM(wrong_answers) as wrong
                FROM study_session
                WHERE deck_id = $1
                GROUP BY game_mode
            `,
				[deckId]
			);

			// Top 5 hardest cards
			const hardestCards = await pool.query(
				`
                SELECT id, front_text, back_text, correct_count, wrong_count,
                       CASE WHEN correct_count + wrong_count > 0
                            THEN ROUND(wrong_count::numeric / (correct_count + wrong_count) * 100, 1)
                            ELSE 0 END as error_rate
                FROM flashcard
                WHERE deck_id = $1 AND (correct_count + wrong_count) > 0
                ORDER BY error_rate DESC, wrong_count DESC
                LIMIT 5
            `,
				[deckId]
			);

			// Top 5 easiest cards
			const easiestCards = await pool.query(
				`
                SELECT id, front_text, back_text, correct_count, wrong_count,
                       CASE WHEN correct_count + wrong_count > 0
                            THEN ROUND(correct_count::numeric / (correct_count + wrong_count) * 100, 1)
                            ELSE 0 END as success_rate
                FROM flashcard
                WHERE deck_id = $1 AND (correct_count + wrong_count) > 0
                ORDER BY success_rate DESC, correct_count DESC
                LIMIT 5
            `,
				[deckId]
			);

			const totalCorrect = parseInt(cardStats.rows[0].total_correct) || 0;
			const totalWrong = parseInt(cardStats.rows[0].total_wrong) || 0;
			const totalAnswers = totalCorrect + totalWrong;

			res.json({
				deck: deckInfo.rows[0],
				stats: {
					totalCorrect,
					totalWrong,
					accuracy:
						totalAnswers > 0
							? Math.round((totalCorrect / totalAnswers) * 100)
							: 0,
					hardCards: parseInt(cardStats.rows[0].hard_cards) || 0,
					easyCards: parseInt(cardStats.rows[0].easy_cards) || 0,
					unstudiedCards: parseInt(cardStats.rows[0].unstudied_cards) || 0,
				},
				sessions: sessions.rows,
				modeStats: modeStats.rows,
				hardestCards: hardestCards.rows,
				easiestCards: easiestCards.rows,
			});
		} catch (err) {
			console.error("Error fetching deck detailed stats:", err);
			res.status(500).json({ error: "Failed to fetch deck stats" });
		}
	});

	// Get card-level stats for a deck
	router.get("/cards/:deckId", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		const { deckId } = req.params;
		const { sort = "id", order = "asc" } = req.query;

		try {
			// Verify ownership
			const ownership = await pool.query(
				"SELECT account_id FROM deck WHERE id = $1",
				[deckId]
			);
			if (ownership.rows.length === 0)
				return res.status(404).json({ error: "Deck not found" });
			if (ownership.rows[0].account_id !== accountId)
				return res.status(403).json({ error: "Access denied" });

			const validSorts = [
				"id",
				"correct_count",
				"wrong_count",
				"accuracy",
				"created_at",
			];
			const sortField = validSorts.includes(sort) ? sort : "id";
			const sortOrder = order === "desc" ? "DESC" : "ASC";

			let orderBy = `${sortField} ${sortOrder}`;
			if (sortField === "accuracy") {
				orderBy = `CASE WHEN correct_count + wrong_count > 0 
                           THEN correct_count::numeric / (correct_count + wrong_count) 
                           ELSE 0 END ${sortOrder}`;
			}

			const cards = await pool.query(
				`
                SELECT id, front_text, back_text, correct_count, wrong_count, created_at,
                       CASE WHEN correct_count + wrong_count > 0
                            THEN ROUND(correct_count::numeric / (correct_count + wrong_count) * 100, 1)
                            ELSE 0 END as accuracy,
                       correct_count + wrong_count as total_attempts
                FROM flashcard
                WHERE deck_id = $1
                ORDER BY ${orderBy}
            `,
				[deckId]
			);

			res.json({ cards: cards.rows });
		} catch (err) {
			console.error("Error fetching card stats:", err);
			res.status(500).json({ error: "Failed to fetch card stats" });
		}
	});

	// Record a study session (called when game ends)
	router.post("/session", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		const {
			deckId,
			gameMode,
			cardsStudied,
			correctAnswers,
			wrongAnswers,
			durationSeconds,
		} = req.body;

		try {
			// Verify deck ownership
			const ownership = await pool.query(
				"SELECT account_id FROM deck WHERE id = $1",
				[deckId]
			);
			if (ownership.rows.length === 0)
				return res.status(404).json({ error: "Deck not found" });
			if (ownership.rows[0].account_id !== accountId)
				return res.status(403).json({ error: "Access denied" });

			const result = await pool.query(
				`
                INSERT INTO study_session (account_id, deck_id, game_mode, cards_studied, correct_answers, wrong_answers, duration_seconds)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `,
				[
					accountId,
					deckId,
					gameMode,
					cardsStudied,
					correctAnswers,
					wrongAnswers,
					durationSeconds,
				]
			);

			res.status(201).json({ session: result.rows[0] });
		} catch (err) {
			console.error("Error recording session:", err);
			res.status(500).json({ error: "Failed to record session" });
		}
	});

	// Get activity heatmap data (last 365 days)
	router.get("/heatmap", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		try {
			const heatmap = await pool.query(
				`
                SELECT 
                    DATE(session_date) as date,
                    SUM(cards_studied) as cards_studied,
                    COUNT(*) as sessions
                FROM study_session
                WHERE account_id = $1 AND session_date >= CURRENT_DATE - INTERVAL '365 days'
                GROUP BY DATE(session_date)
                ORDER BY date ASC
            `,
				[accountId]
			);

			res.json({ heatmap: heatmap.rows });
		} catch (err) {
			console.error("Error fetching heatmap:", err);
			res.status(500).json({ error: "Failed to fetch heatmap" });
		}
	});

	// Get time-based insights
	router.get("/insights", authenticateToken, async (req, res) => {
		const accountId = req.user.accountId;
		try {
			// Best study hour
			const bestHour = await pool.query(
				`
                SELECT 
                    EXTRACT(HOUR FROM session_date) as hour,
                    AVG(CASE WHEN cards_studied > 0 
                        THEN correct_answers::numeric / cards_studied * 100 
                        ELSE 0 END) as avg_accuracy,
                    SUM(cards_studied) as total_cards
                FROM study_session
                WHERE account_id = $1
                GROUP BY EXTRACT(HOUR FROM session_date)
                HAVING SUM(cards_studied) >= 10
                ORDER BY avg_accuracy DESC
                LIMIT 1
            `,
				[accountId]
			);

			// Best study day
			const bestDay = await pool.query(
				`
                SELECT 
                    EXTRACT(DOW FROM session_date) as day_of_week,
                    AVG(CASE WHEN cards_studied > 0 
                        THEN correct_answers::numeric / cards_studied * 100 
                        ELSE 0 END) as avg_accuracy,
                    SUM(cards_studied) as total_cards
                FROM study_session
                WHERE account_id = $1
                GROUP BY EXTRACT(DOW FROM session_date)
                HAVING SUM(cards_studied) >= 10
                ORDER BY avg_accuracy DESC
                LIMIT 1
            `,
				[accountId]
			);

			// Weekly comparison
			const weeklyComparison = await pool.query(
				`
                SELECT 
                    CASE WHEN session_date >= CURRENT_DATE - INTERVAL '7 days' THEN 'current' ELSE 'previous' END as week,
                    SUM(cards_studied) as cards,
                    SUM(correct_answers) as correct,
                    SUM(wrong_answers) as wrong
                FROM study_session
                WHERE account_id = $1 AND session_date >= CURRENT_DATE - INTERVAL '14 days'
                GROUP BY CASE WHEN session_date >= CURRENT_DATE - INTERVAL '7 days' THEN 'current' ELSE 'previous' END
            `,
				[accountId]
			);

			// Most active mode
			const mostActiveMode = await pool.query(
				`
                SELECT game_mode, COUNT(*) as sessions, SUM(cards_studied) as cards
                FROM study_session
                WHERE account_id = $1
                GROUP BY game_mode
                ORDER BY cards DESC
                LIMIT 1
            `,
				[accountId]
			);

			const dayNames = [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
			];

			res.json({
				bestHour: bestHour.rows[0]
					? {
							hour: parseInt(bestHour.rows[0].hour),
							accuracy: Math.round(parseFloat(bestHour.rows[0].avg_accuracy)),
					  }
					: null,
				bestDay: bestDay.rows[0]
					? {
							day: dayNames[parseInt(bestDay.rows[0].day_of_week)],
							accuracy: Math.round(parseFloat(bestDay.rows[0].avg_accuracy)),
					  }
					: null,
				weeklyComparison: weeklyComparison.rows.reduce(
					(acc, row) => {
						acc[row.week] = {
							cards: parseInt(row.cards) || 0,
							correct: parseInt(row.correct) || 0,
							wrong: parseInt(row.wrong) || 0,
						};
						return acc;
					},
					{
						current: { cards: 0, correct: 0, wrong: 0 },
						previous: { cards: 0, correct: 0, wrong: 0 },
					}
				),
				mostActiveMode: mostActiveMode.rows[0] || null,
			});
		} catch (err) {
			console.error("Error fetching insights:", err);
			res.status(500).json({ error: "Failed to fetch insights" });
		}
	});

	return router;
};
