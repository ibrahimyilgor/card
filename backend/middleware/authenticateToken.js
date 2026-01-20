const { admin } = require("../config/firebase");

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID token and ensures email is verified
 * Attaches user info to req.user
 */
async function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "No token provided" });
	}

	// Check if Firebase is configured
	if (!admin.apps.length) {
		console.error("Firebase Admin SDK not initialized");
		return res
			.status(500)
			.json({ error: "Authentication service unavailable" });
	}

	try {
		// Verify the Firebase ID token
		const decodedToken = await admin.auth().verifyIdToken(token);

		// Check if email is verified (required)
		if (!decodedToken.email_verified) {
			return res.status(403).json({
				error: "Email not verified",
				code: "EMAIL_NOT_VERIFIED",
			});
		}

		// Attach Firebase user info to request
		req.firebaseUser = {
			uid: decodedToken.uid,
			email: decodedToken.email,
			emailVerified: decodedToken.email_verified,
			displayName: decodedToken.name || null,
			photoURL: decodedToken.picture || null,
		};

		// Get the database account ID from Firebase UID
		// This will be set by the /auth/sync endpoint after first login
		const pool = req.app.get("pool");
		if (pool) {
			const result = await pool.query(
				"SELECT id FROM account WHERE firebase_uid = $1",
				[decodedToken.uid],
			);

			if (result.rows.length > 0) {
				req.user = {
					accountId: result.rows[0].id,
					firebaseUid: decodedToken.uid,
					email: decodedToken.email,
				};
			} else {
				// Account not synced yet - let the request continue
				// The /auth/sync endpoint will create the account
				req.user = {
					accountId: null,
					firebaseUid: decodedToken.uid,
					email: decodedToken.email,
					needsSync: true,
				};
			}
		}

		next();
	} catch (error) {
		console.error("Token verification error:", error.code, error.message);

		if (error.code === "auth/id-token-expired") {
			return res.status(401).json({ error: "Token expired" });
		}

		if (error.code === "auth/argument-error") {
			return res.status(401).json({ error: "Invalid token format" });
		}

		return res.status(401).json({ error: "Invalid token" });
	}
}

module.exports = authenticateToken;
