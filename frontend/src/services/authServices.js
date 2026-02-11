import { firebaseAuth } from "../config/firebase";
import api from "./api";

/**
 * Firebase Authentication Services - Google Sign-In Only
 *
 * All authentication is handled by Firebase with Google provider.
 * After successful auth, we sync the user with our backend database.
 * Session persistence is set to LOCAL - user stays logged in.
 */

// Sign in with Google
export const signInWithGoogle = async () => {
	const user = await firebaseAuth.signInWithGoogle();

	// Sync with backend
	const syncResult = await syncWithBackend();
	return {
		user,
		...syncResult,
	};
};

// Sign out
export const signOut = async () => {
	await firebaseAuth.signOut();
	localStorage.removeItem("accountId");
};

// Get current user
export const getCurrentUser = () => {
	return firebaseAuth.getCurrentUser();
};

// Check if user is authenticated
export const isAuthenticated = () => {
	return firebaseAuth.isAuthenticated();
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

// Legacy export for backward compatibility
export const logout = signOut;
