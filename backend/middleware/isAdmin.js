/**
 * Admin Authorization Middleware
 * Must be used AFTER authenticateToken middleware
 * Checks if the authenticated user has admin role
 */
function isAdmin(req, res, next) {
	// Ensure user is authenticated first
	if (!req.user) {
		return res.status(401).json({ error: "Authentication required" });
	}

	// Check if user has admin role
	if (req.user.role !== "admin") {
		return res.status(403).json({ error: "Admin access required" });
	}

	next();
}

module.exports = isAdmin;
