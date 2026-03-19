const googlePlayService = require("../services/googlePlayService");
const {
	normalizeSubscriptionState,
	resolveTargetPlanCode,
	applyPlanTransition,
	upsertPlanSubscription,
} = require("../services/subscriptionSyncService");

const defaultLogger = {
	info: (...args) => console.log(...args),
	warn: (...args) => console.warn(...args),
	error: (...args) => console.error(...args),
};

const createSubscriptionReconciliationWorker = (
	pool,
	{ logger = defaultLogger } = {},
) => {
	let inFlight = false;

	const getBatchSize = () => {
		const parsed = Number(100);
		if (!Number.isFinite(parsed) || parsed <= 0) return 100;
		return Math.min(parsed, 500);
	};

	const isGoogleVerificationAvailable = () => true;

	const runOnce = async () => {
		if (inFlight) {
			logger.info("[subscription-reconcile] skipped: already running");
			return { skipped: true };
		}

		if (process.env.GOOGLE_PLAY_VERIFY_DISABLED === "true") {
			logger.warn(
				"[subscription-reconcile] skipped: GOOGLE_PLAY_VERIFY_DISABLED=true",
			);
			return { skipped: true };
		}

		if (!isGoogleVerificationAvailable()) {
			logger.warn(
				"[subscription-reconcile] skipped: google verify env not configured",
			);
			return { skipped: true };
		}

		inFlight = true;
		const summary = {
			total: 0,
			updated: 0,
			failed: 0,
			skipped: 0,
		};

		try {
			const batchSize = getBatchSize();
			const subscriptions = await pool.query(
				`SELECT account_id, product_id, purchase_token, subscription_state, expires_at, auto_renewing
				 FROM plan_subscription
				 WHERE platform = 'google_play'
				 ORDER BY updated_at ASC
				 LIMIT $1`,
				[batchSize],
			);

			summary.total = subscriptions.rows.length;

			for (const sub of subscriptions.rows) {
				const client = await pool.connect();
				try {
					const verification = await googlePlayService.verifySubscription({
						packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME,
						productId: sub.product_id,
						purchaseToken: sub.purchase_token,
					});

					const normalizedState = normalizeSubscriptionState(
						verification.subscriptionState,
					);
					const targetPlanCode = resolveTargetPlanCode(
						verification.productId,
						normalizedState,
						verification.currentPeriodEnd,
					);

					if (!targetPlanCode) {
						summary.skipped += 1;
						continue;
					}

					await client.query("BEGIN");

					await upsertPlanSubscription(client, {
						accountId: sub.account_id,
						platform: "google_play",
						productId: verification.productId,
						purchaseToken: verification.purchaseToken,
						subscriptionState: normalizedState,
						currentPeriodEnd: verification.currentPeriodEnd,
						autoRenewing: verification.autoRenewing,
						rawPayload: {
							source: "reconciliation",
							verification: verification.rawPayload,
						},
					});

					const plan = await applyPlanTransition(
						client,
						sub.account_id,
						targetPlanCode,
						`google_play_reconcile_${normalizedState}`,
						verification.currentPeriodEnd,
					);

					await client.query("COMMIT");
					summary.updated += 1;

					logger.info("[subscription-reconcile] synced", {
						accountId: sub.account_id,
						subscriptionState: normalizedState,
						targetPlanCode: plan.code,
					});
				} catch (error) {
					summary.failed += 1;
					try {
						await client.query("ROLLBACK");
					} catch {
						// ignore rollback failures
					}

					logger.error("[subscription-reconcile] failed", {
						accountId: sub.account_id,
						message: error?.message,
					});
				} finally {
					client.release();
				}
			}

			logger.info("[subscription-reconcile] completed", summary);
			return summary;
		} finally {
			inFlight = false;
		}
	};

	return {
		runOnce,
	};
};

module.exports = {
	createSubscriptionReconciliationWorker,
};
