const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// In production, use GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to your service account JSON file
let firebaseApp;

try {
	if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
		// Production: Use service account file
		firebaseApp = admin.initializeApp({
			credential: admin.credential.applicationDefault(),
			projectId: process.env.FIREBASE_PROJECT_ID,
		});
	} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
		// Alternative: Use service account JSON from environment variable
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
		firebaseApp = admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			projectId: serviceAccount.project_id,
		});
	} else {
		console.warn(
			"Firebase Admin SDK not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT environment variable.",
		);
		firebaseApp = null;
	}
} catch (error) {
	console.error("Error initializing Firebase Admin SDK:", error);
	firebaseApp = null;
}

module.exports = { admin, firebaseApp };
