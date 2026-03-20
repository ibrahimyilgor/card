const express = require("express");
const crypto = require("crypto");
const { webhookLimiter } = require("../middleware/rateLimiter");
const googlePlayService = require("../services/googlePlayService");
const {
	resolveTargetPlanCode,
	applyPlanTransition,
	upsertPlanSubscription,
	normalizeSubscriptionState,
} = require("../services/subscriptionSyncService");

const mapRtdnTypeToState = (notificationType) => {
	const numericType = Number(notificationType);

	switch (numericType) {
		case 1:
		case 2:
		case 4:
		case 7:
			return "active";
		case 3:
			return "canceled";
		case 5:
			return "on_hold";
		case 10:
			return "paused";
		case 12:
			return "revoked";
		case 13:
			return "expired";
		default:
			return "active";
	}
};

module.exports = (pool) => {
	const router = express.Router();

	router.post("/google-play", webhookLimiter, async (req, res) => {
		const verificationToken = process.env.GOOGLE_RTDN_VERIFICATION_TOKEN;
		if (verificationToken) {
			const providedToken = req.headers["x-rtdn-token"];
			if (providedToken !== verificationToken) {
				return res.status(401).json({ error: "Unauthorized webhook" });
			}
		}

		try {
			const pubSubMessage = req.body?.message;
			const messageData = req.body?.message?.data;
			if (!messageData) {
				return res.status(400).json({ error: "Missing Pub/Sub data" });
			}

			const eventKey =
				pubSubMessage?.messageId ||
				crypto.createHash("sha256").update(messageData).digest("hex");

			const decoded = JSON.parse(
				Buffer.from(messageData, "base64").toString("utf8"),
			);

			const subNotif = decoded.subscriptionNotification;
			if (!subNotif?.purchaseToken || !subNotif?.subscriptionId) {
				return res
					.status(202)
					.json({ ignored: true, reason: "No subscription" });
			}

			const accountLookup = await pool.query(
				`SELECT account_id
				 FROM plan_subscription
				 WHERE purchase_token = $1
				 ORDER BY updated_at DESC
				 LIMIT 1`,
				[subNotif.purchaseToken],
			);

			if (accountLookup.rows.length === 0) {
				return res.status(202).json({ ignored: true, reason: "Unknown token" });
			}

			const accountId = accountLookup.rows[0].account_id;
			const packageName =
				decoded.packageName || process.env.GOOGLE_PLAY_PACKAGE_NAME;

			let verification;
			try {
				verification = await googlePlayService.verifySubscription({
					packageName,
					productId: subNotif.subscriptionId,
					purchaseToken: subNotif.purchaseToken,
				});
			} catch (error) {
				verification = {
					productId: subNotif.subscriptionId,
					purchaseToken: subNotif.purchaseToken,
					subscriptionState: mapRtdnTypeToState(subNotif.notificationType),
					autoRenewing: false,
					currentPeriodEnd: null,
					rawPayload: {
						googleError: error.message,
						decoded,
					},
				};
			}

			const normalizedState = normalizeSubscriptionState(
				verification.subscriptionState,
			);
			const targetPlanCode = resolveTargetPlanCode(
				verification.productId,
				normalizedState,
				verification.currentPeriodEnd,
			);

			if (!targetPlanCode) {
				return res.status(202).json({
					ignored: true,
					reason: "Unknown product mapping",
					productId: verification.productId,
				});
			}

			const client = await pool.connect();
			try {
				await client.query("BEGIN");

				const idempotencyInsert = await client.query(
					`INSERT INTO subscription_webhook_event (provider, event_key, payload)
					 VALUES ('google_play', $1, $2::jsonb)
					 ON CONFLICT (provider, event_key) DO NOTHING`,
					[eventKey, JSON.stringify(req.body)],
				);

				if (idempotencyInsert.rowCount === 0) {
					await client.query("ROLLBACK");
					return res.json({
						success: true,
						ignored: true,
						reason: "duplicate_event",
					});
				}

				await upsertPlanSubscription(client, {
					accountId,
					platform: "google_play",
					productId: verification.productId,
					purchaseToken: verification.purchaseToken,
					subscriptionState: normalizedState,
					currentPeriodEnd: verification.currentPeriodEnd,
					autoRenewing: verification.autoRenewing,
					rawPayload: {
						decoded,
						verification: verification.rawPayload,
					},
				});

				await applyPlanTransition(
					client,
					accountId,
					targetPlanCode,
					`google_rtdn_${normalizedState}`,
					verification.currentPeriodEnd,
				);

				await client.query("COMMIT");
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			} finally {
				client.release();
			}

			return res.json({ success: true });
		} catch (error) {
			console.error("Error processing RTDN webhook:", error);
			return res.status(500).json({ error: "Failed to process webhook" });
		}
	});

	return router;
};
