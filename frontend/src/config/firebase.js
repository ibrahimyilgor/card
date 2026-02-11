import { initializeApp } from "firebase/app";
import {
	getAuth,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	onAuthStateChanged,
	browserLocalPersistence,
	setPersistence,
} from "firebase/auth";

// Firebase configuration - Replace with your Firebase project config
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Set persistence to LOCAL - user stays logged in even after browser close
setPersistence(auth, browserLocalPersistence).catch((error) => {
	console.error("Failed to set auth persistence:", error);
});

// Auth functions - Google Sign-In only
export const firebaseAuth = {
	// Get current user
	getCurrentUser: () => auth.currentUser,

	// Get ID token for API calls
	getIdToken: async () => {
		const user = auth.currentUser;
		if (!user) return null;
		return user.getIdToken();
	},

	// Force refresh ID token
	getIdTokenForced: async () => {
		const user = auth.currentUser;
		if (!user) return null;
		return user.getIdToken(true);
	},

	// Sign in with Google
	signInWithGoogle: async () => {
		const userCredential = await signInWithPopup(auth, googleProvider);
		return userCredential.user;
	},

	// Sign out
	signOut: async () => {
		await signOut(auth);
	},

	// Check if user is authenticated
	isAuthenticated: () => {
		return auth.currentUser !== null;
	},

	// Listen to auth state changes
	onAuthStateChanged: (callback) => {
		return onAuthStateChanged(auth, callback);
	},
};

export { auth };
export default app;
