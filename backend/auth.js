const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authenticateToken = require("./middleware/authenticateToken");

module.exports = (pool) => {
	const router = express.Router();

	// Register
	router.post("/register", async (req, res) => {
		const { accountname, password } = req.body;
		if (!accountname || !password)
			return res
				.status(400)
				.json({ error: "Account name and password required" });

		// Password validation: min 8 characters, must contain letters and numbers
		if (
			password.length < 8 ||
			!/[A-Za-z]/.test(password) ||
			!/[0-9]/.test(password)
		) {
			return res.status(400).json({
				error:
					"Password must be at least 8 characters and contain letters and numbers",
			});
		}

		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			const hash = await bcrypt.hash(password, 10);
			const accountResult = await client.query(
				"INSERT INTO account (accountname, password_hash) VALUES ($1, $2) RETURNING id",
				[accountname, hash]
			);
			const accountId = accountResult.rows[0].id;

			// Create account_preferences
			await client.query(
				"INSERT INTO account_preferences (account_id) VALUES ($1)",
				[accountId]
			);

			// Get free plan id
			const freePlanResult = await client.query(
				"SELECT id FROM plan WHERE code = 'free'"
			);
			const freePlanId = freePlanResult.rows[0]?.id || 1;

			// Create account_plan (assign free plan)
			await client.query(
				"INSERT INTO account_plan (account_id, plan_id, started_at, is_active) VALUES ($1, $2, CURRENT_TIMESTAMP, TRUE)",
				[accountId, freePlanId]
			);

			// Create account_plan_history entry
			await client.query(
				"INSERT INTO account_plan_history (account_id, plan_id, started_at, change_reason) VALUES ($1, $2, CURRENT_TIMESTAMP, 'signup')",
				[accountId, freePlanId]
			);

			// Generate access token (60 minutes)
			const token = jwt.sign(
				{ accountId, accountname },
				process.env.JWT_SECRET || "dev_secret",
				{ expiresIn: "60m" }
			);

			// Generate refresh token (30 days)
			const refreshToken = crypto.randomBytes(64).toString("hex");
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 30);

			// Store refresh token in database
			await client.query(
				"INSERT INTO refresh_token (token, account_id, expires_at) VALUES ($1, $2, $3)",
				[refreshToken, accountId, expiresAt]
			);

			await client.query("COMMIT");
			res.status(201).json({ message: "Account registered", token, refreshToken, accountId });
		} catch (err) {
			await client.query("ROLLBACK");
			console.error("Register error:", err);
			if (err.code === "23505")
				return res.status(409).json({ error: "accountname already exists" });
			res.status(500).json({ error: "Registration failed" });
		} finally {
			client.release();
		}
	});

	// Login
	router.post("/login", async (req, res) => {
		const { accountname, password } = req.body;
		if (!accountname || !password)
			return res
				.status(400)
				.json({ error: "Account name and password required" });
		try {
			const result = await pool.query(
				"SELECT id, password_hash FROM account WHERE accountname = $1",
				[accountname]
			);
			if (result.rows.length === 0)
				return res.status(401).json({ error: "Invalid credentials" });
			const valid = await bcrypt.compare(
				password,
				result.rows[0].password_hash
			);
			if (!valid) return res.status(401).json({ error: "Invalid credentials" });

			const accountId = result.rows[0].id;

			// Generate access token (60 minutes)
			const token = jwt.sign(
				{ accountId, accountname },
				process.env.JWT_SECRET || "dev_secret",
				{ expiresIn: "60m" }
			);

			// Generate refresh token (30 days)
			const refreshToken = crypto.randomBytes(64).toString("hex");
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 30);

			// Store refresh token in database
			await pool.query(
				"INSERT INTO refresh_token (token, account_id, expires_at) VALUES ($1, $2, $3)",
				[refreshToken, accountId, expiresAt]
			);

			res.json({ message: "Login successful", token, refreshToken, accountId });
		} catch (err) {
			console.error("Login error:", err);
			res.status(500).json({ error: "Login failed" });
		}
	});

	// Refresh token endpoint
	router.post("/refresh", async (req, res) => {
		const { refreshToken } = req.body;
		if (!refreshToken)
			return res.status(400).json({ error: "Refresh token required" });

		try {
			// Find valid refresh token
			const result = await pool.query(
				`SELECT rt.account_id, a.accountname 
				 FROM refresh_token rt 
				 JOIN account a ON rt.account_id = a.id 
				 WHERE rt.token = $1 AND rt.expires_at > NOW()`,
				[refreshToken]
			);

			if (result.rows.length === 0)
				return res
					.status(401)
					.json({ error: "Invalid or expired refresh token" });

			const { account_id: accountId, accountname } = result.rows[0];

			// Generate new access token (60 minutes)
			const token = jwt.sign(
				{ accountId, accountname },
				process.env.JWT_SECRET || "dev_secret",
				{ expiresIn: "60m" }
			);

			res.json({ token });
		} catch (err) {
			console.error("Refresh token error:", err);
			res.status(500).json({ error: "Token refresh failed" });
		}
	});

	// Logout endpoint - invalidate refresh token
	router.post("/logout", async (req, res) => {
		const { refreshToken } = req.body;
		if (!refreshToken)
			return res.status(400).json({ error: "Refresh token required" });

		try {
			await pool.query("DELETE FROM refresh_token WHERE token = $1", [
				refreshToken,
			]);
			res.json({ message: "Logged out successfully" });
		} catch (err) {
			console.error("Logout error:", err);
			res.status(500).json({ error: "Logout failed" });
		}
	});

	router.authenticateToken = authenticateToken;
	return router;
};
