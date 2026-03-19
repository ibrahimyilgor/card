const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();
const app = express();
const port = 5000;

const pool = new Pool(
	process.env.DATABASE_URL
		? {
				connectionString: process.env.DATABASE_URL,
				ssl: { rejectUnauthorized: false },
			}
		: {
				user: "postgres",
				host: process.env.PGHOST || "db",
				database: "postgres",
				password: "postgres",
				port: 5432,
			},
);

app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "*",
		credentials: true,
	}),
);

// Make pool available to middleware
app.set("pool", pool);

const authRouter = require("./auth")(pool);
const accountRouter = require("./account")(pool);
const decksRouter = require("./decks")(pool);
const flashcardsRouter = require("./flashcards")(pool);
const gameRouter = require("./game")(pool);
const statsRouter = require("./stats")(pool);
const achievementsRouter = require("./achievements")(pool);
const adminRouter = require("./admin")(pool);
const subscriptionsRouter = require("./subscriptions")(pool);
const {
	createSubscriptionReconciliationWorker,
} = require("./workers/subscriptionReconciliationWorker");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/account", accountRouter);
app.use("/decks", decksRouter);
app.use("/games", gameRouter);
app.use("/flashcards", flashcardsRouter);
app.use("/stats", statsRouter);
app.use("/achievements", achievementsRouter);
app.use("/admin", adminRouter);
app.use("/subscriptions", subscriptionsRouter);

app.get("/health", async (req, res) => {
	res.status(200).json({
		ok: true,
		service: "backend",
		uptimeSec: Math.floor(process.uptime()),
		timestamp: new Date().toISOString(),
	});
});

app.listen(port, () => {
	console.log(`Backend listening at port: ${port}`);

	const reconciliationEnabled = true;
	if (!reconciliationEnabled) {
		console.log(
			"Subscription reconciliation is disabled (ENABLE_SUBSCRIPTION_RECONCILIATION=false)",
		);
		return;
	}

	const cronExpression = "0 */6 * * *";
	if (!cron.validate(cronExpression)) {
		console.error(
			`Invalid SUBSCRIPTION_RECONCILIATION_CRON: ${cronExpression}`,
		);
		return;
	}

	const worker = createSubscriptionReconciliationWorker(pool);
	cron.schedule(cronExpression, async () => {
		try {
			await worker.runOnce();
		} catch (error) {
			console.error(
				"[subscription-reconcile] scheduled run failed:",
				error?.message,
			);
		}
	});

	console.log(
		`Subscription reconciliation enabled with schedule: ${cronExpression}`,
	);

	if (true) {
		worker
			.runOnce()
			.catch((error) =>
				console.error(
					"[subscription-reconcile] startup run failed:",
					error?.message,
				),
			);
	}
});
