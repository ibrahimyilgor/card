const { rateLimit } = require("express-rate-limit");

const toNumber = (value, fallback) => {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildRateLimitHandler = (name) => (req, res) => {
	const retryAfterSec = req.rateLimit?.resetTime
		? Math.ceil((new Date(req.rateLimit.resetTime).getTime() - Date.now()) / 1000)
		: undefined;

	console.warn("[rate-limit] blocked", {
		name,
		path: req.originalUrl,
		ip: req.ip,
		retryAfterSec,
	});

	return res.status(429).json({
		error: "Too many requests",
		message: "Please try again later.",
		retryAfter: retryAfterSec,
	});
};

const createLimiter = ({ name, windowMs, max, skip }) =>
	rateLimit({
		windowMs,
		max,
		standardHeaders: true,
		legacyHeaders: false,
		skip,
		handler: buildRateLimitHandler(name),
	});

const globalLimiter = createLimiter({
	name: "global",
	windowMs: toNumber(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 15 * 60 * 1000),
	max: toNumber(process.env.RATE_LIMIT_GLOBAL_MAX, 300),
	skip: (req) => req.path === "/health",
});

const authLimiter = createLimiter({
	name: "auth",
	windowMs: toNumber(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 15 * 60 * 1000),
	max: toNumber(process.env.RATE_LIMIT_AUTH_MAX, 60),
});

const statsLimiter = createLimiter({
	name: "stats",
	windowMs: toNumber(process.env.RATE_LIMIT_STATS_WINDOW_MS, 15 * 60 * 1000),
	max: toNumber(process.env.RATE_LIMIT_STATS_MAX, 100),
});

const webhookLimiter = createLimiter({
	name: "webhook",
	windowMs: toNumber(process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS, 60 * 1000),
	max: toNumber(process.env.RATE_LIMIT_WEBHOOK_MAX, 30),
});

module.exports = {
	globalLimiter,
	authLimiter,
	statsLimiter,
	webhookLimiter,
};
