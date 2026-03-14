const PRODUCT_PLAN_MAP = {
	pro_monthly: "pro",
	premium_monthly: "premium",
};

const EXPIRED_OR_RESTRICTED_STATES = new Set([
	"expired",
	"revoked",
	"on_hold",
	"paused",
]);

const normalizeSubscriptionState = (subscriptionState) => {
	const raw = String(subscriptionState || "")
		.toLowerCase()
		.trim();
	if (!raw) return "active";
	return raw.replace("subscription_state_", "");
};

const resolveTargetPlanCode = (productId, subscriptionState) => {
	const normalizedState = normalizeSubscriptionState(subscriptionState);

	if (EXPIRED_OR_RESTRICTED_STATES.has(normalizedState)) {
		return "free";
	}

	return PRODUCT_PLAN_MAP[productId] || null;
};

const applyPlanTransition = async (
	client,
	accountId,
	targetPlanCode,
	reason,
	currentPeriodEnd,
) => {
	const targetPlanResult = await client.query(
		"SELECT id, code, name FROM plan WHERE code = $1",
		[targetPlanCode],
	);

	if (targetPlanResult.rows.length === 0) {
		throw new Error(`Invalid plan code: ${targetPlanCode}`);
	}

	const targetPlan = targetPlanResult.rows[0];

	const currentPlanResult = await client.query(
		`SELECT ap.plan_id, ap.started_at, p.code AS plan_code
		 FROM account_plan ap
		 JOIN plan p ON p.id = ap.plan_id
		 WHERE ap.account_id = $1`,
		[accountId],
	);

	if (currentPlanResult.rows.length === 0) {
		await client.query(
			`INSERT INTO account_plan (account_id, plan_id, started_at, ends_at, is_active, updated_at)
			 VALUES ($1, $2, NOW(), $3, TRUE, NOW())
			 ON CONFLICT (account_id) DO UPDATE
			 SET plan_id = EXCLUDED.plan_id,
				 started_at = NOW(),
				 ends_at = EXCLUDED.ends_at,
				 is_active = TRUE,
				 updated_at = NOW()`,
			[accountId, targetPlan.id, currentPeriodEnd],
		);

		return targetPlan;
	}

	const currentPlan = currentPlanResult.rows[0];
	const isPlanChanged = currentPlan.plan_code !== targetPlan.code;

	if (isPlanChanged) {
		await client.query(
			`INSERT INTO account_plan_history
			 (account_id, plan_id, started_at, ended_at, change_reason)
			 VALUES ($1, $2, $3, NOW(), $4)`,
			[accountId, currentPlan.plan_id, currentPlan.started_at, reason],
		);

		await client.query(
			`UPDATE account_plan
			 SET plan_id = $1,
				 started_at = NOW(),
				 ends_at = $2,
				 is_active = TRUE,
				 updated_at = NOW()
			 WHERE account_id = $3`,
			[targetPlan.id, currentPeriodEnd, accountId],
		);
	} else {
		await client.query(
			`UPDATE account_plan
			 SET ends_at = $1,
				 is_active = TRUE,
				 updated_at = NOW()
			 WHERE account_id = $2`,
			[currentPeriodEnd, accountId],
		);
	}

	return targetPlan;
};

const upsertPlanSubscription = async (
	client,
	{
		accountId,
		platform = "google_play",
		productId,
		purchaseToken,
		subscriptionState,
		currentPeriodEnd,
		autoRenewing,
		rawPayload,
	},
) => {
	await client.query(
		`INSERT INTO plan_subscription
		 (account_id, platform, product_id, purchase_token, subscription_state, expires_at, auto_renewing, raw_payload, updated_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW(), NOW())
		 ON CONFLICT (account_id) DO UPDATE
		 SET platform = EXCLUDED.platform,
			 product_id = EXCLUDED.product_id,
			 purchase_token = EXCLUDED.purchase_token,
			 subscription_state = EXCLUDED.subscription_state,
			 expires_at = EXCLUDED.expires_at,
			 auto_renewing = EXCLUDED.auto_renewing,
			 raw_payload = EXCLUDED.raw_payload,
			 updated_at = NOW()`,
		[
			accountId,
			platform,
			productId,
			purchaseToken,
			normalizeSubscriptionState(subscriptionState),
			currentPeriodEnd,
			Boolean(autoRenewing),
			rawPayload ? JSON.stringify(rawPayload) : null,
		],
	);
};

module.exports = {
	PRODUCT_PLAN_MAP,
	normalizeSubscriptionState,
	resolveTargetPlanCode,
	applyPlanTransition,
	upsertPlanSubscription,
};
