const fetch = require("node-fetch");
const crypto = require("crypto");

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const ANDROID_PUBLISHER_SCOPE =
	"https://www.googleapis.com/auth/androidpublisher";

let cachedAccessToken = null;
let cachedAccessTokenExpiry = 0;

const getServiceAccountConfig = () => {
	const rawJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
	if (!rawJson) {
		throw new Error("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is required");
	}

	let parsed;
	try {
		parsed = JSON.parse(rawJson);
	} catch (error) {
		throw new Error("Invalid GOOGLE_PLAY_SERVICE_ACCOUNT_JSON");
	}

	if (!parsed.client_email || !parsed.private_key) {
		throw new Error("Service account JSON missing client_email/private_key");
	}

	return parsed;
};

const base64UrlEncode = (input) =>
	Buffer.from(input)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

const createSignedJwt = (serviceAccount) => {
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + 3600;

	const header = {
		alg: "RS256",
		typ: "JWT",
	};

	const payload = {
		iss: serviceAccount.client_email,
		scope: ANDROID_PUBLISHER_SCOPE,
		aud: GOOGLE_TOKEN_URL,
		iat,
		exp,
	};

	const encodedHeader = base64UrlEncode(JSON.stringify(header));
	const encodedPayload = base64UrlEncode(JSON.stringify(payload));
	const unsignedToken = `${encodedHeader}.${encodedPayload}`;

	const signer = crypto.createSign("RSA-SHA256");
	signer.update(unsignedToken);
	signer.end();

	const signature = signer
		.sign(serviceAccount.private_key, "base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	return `${unsignedToken}.${signature}`;
};

const getGoogleAccessToken = async () => {
	const now = Date.now();
	if (cachedAccessToken && now < cachedAccessTokenExpiry - 30_000) {
		return cachedAccessToken;
	}

	const serviceAccount = getServiceAccountConfig();
	const assertion = createSignedJwt(serviceAccount);

	const tokenResp = await fetch(GOOGLE_TOKEN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion,
		}),
	});

	if (!tokenResp.ok) {
		const errorText = await tokenResp.text();
		throw new Error(`Google token request failed: ${errorText}`);
	}

	const tokenData = await tokenResp.json();
	cachedAccessToken = tokenData.access_token;
	cachedAccessTokenExpiry = now + Number(tokenData.expires_in || 3600) * 1000;

	return cachedAccessToken;
};

const resolveSubscriptionState = (payload) => {
	const expiresAt = Number(payload.expiryTimeMillis || 0);
	const isExpired = expiresAt > 0 && expiresAt <= Date.now();

	if (isExpired) return "expired";
	if (payload.cancelReason !== undefined && payload.cancelReason !== null) {
		return "canceled";
	}
	if (payload.paymentState === 0) return "pending";
	return "active";
};

const verifySubscription = async ({ packageName, productId, purchaseToken }) => {
	if (!packageName) {
		throw new Error("GOOGLE_PLAY_PACKAGE_NAME is required");
	}
	if (!productId || !purchaseToken) {
		throw new Error("productId and purchaseToken are required");
	}

	const accessToken = await getGoogleAccessToken();
	const endpoint = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
		packageName,
	)}/purchases/subscriptions/${encodeURIComponent(
		productId,
	)}/tokens/${encodeURIComponent(purchaseToken)}`;

	const response = await fetch(endpoint, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Google Play verify failed (${response.status}): ${errorBody}`);
	}

	const payload = await response.json();
	const currentPeriodEnd = payload.expiryTimeMillis
		? new Date(Number(payload.expiryTimeMillis)).toISOString()
		: null;
	const autoRenewing = Boolean(payload.autoRenewing);
	const subscriptionState = resolveSubscriptionState(payload);

	return {
		productId,
		purchaseToken,
		subscriptionState,
		autoRenewing,
		currentPeriodEnd,
		rawPayload: payload,
	};
};

module.exports = {
	verifySubscription,
};
