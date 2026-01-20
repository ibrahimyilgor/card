import { firebaseAuth } from "../config/firebase";
import api from "./api";

/**
 * Firebase Authentication Services
 *
 * All authentication is handled by Firebase. After successful auth,
 * we sync the user with our backend database.
 */

// Sign up with email and password
export const signUp = async (email, password) => {
	const user = await firebaseAuth.signUp(email, password);
	return {
		user,
		emailVerificationSent: true,
		message: "Verification email sent. Please check your inbox.",
	};
};

// Sign in with email and password
export const signIn = async (email, password) => {
	const user = await firebaseAuth.signIn(email, password);

	// Check if email is verified
	if (!user.emailVerified) {
		return {
			user,
			emailVerified: false,
			error: "Please verify your email before signing in.",
		};
	}

	// Sync with backend
	const syncResult = await syncWithBackend();
	return {
		user,
		emailVerified: true,
		...syncResult,
	};
};

// Sign in with Google
export const signInWithGoogle = async () => {
	const user = await firebaseAuth.signInWithGoogle();

	// Google accounts are always verified
	const syncResult = await syncWithBackend();
	return {
		user,
		emailVerified: true,
		...syncResult,
	};
};

// Sign out
export const signOut = async () => {
	await firebaseAuth.signOut();
	localStorage.removeItem("accountId");
};

// Send verification email
export const sendVerificationEmail = async () => {
	await firebaseAuth.sendVerificationEmail();
};

// Reload user to check verification status
export const reloadUser = async () => {
	return await firebaseAuth.reloadUser();
};

// Check if email is verified
export const isEmailVerified = () => {
	return firebaseAuth.isEmailVerified();
};

// Get current user
export const getCurrentUser = () => {
	return firebaseAuth.getCurrentUser();
};

// Sync Firebase user with backend database
export const syncWithBackend = async (displayName) => {
	try {
		const response = await api.post("/auth/sync", { displayName });
		const { accountId } = response.data;

		if (accountId) {
			localStorage.setItem("accountId", accountId);
		}

		return response.data;
	} catch (error) {
		console.error("Failed to sync with backend:", error);
		throw error;
	}
};

// Get current user info from backend
export const getCurrentUserInfo = async () => {
	const response = await api.get("/auth/me");
	return response.data;
};

// Delete account (both backend and Firebase)
export const deleteAccount = async () => {
	// Delete from backend first
	await api.delete("/auth/account");

	// Then delete from Firebase
	const user = firebaseAuth.getCurrentUser();
	if (user) {
		await user.delete();
	}

	localStorage.removeItem("accountId");
};

// Listen to auth state changes
export const onAuthStateChanged = (callback) => {
	return firebaseAuth.onAuthStateChanged(callback);
};

// Legacy exports for backward compatibility during migration
export const login = signIn;
export const register = signUp;
export const logout = signOut;
