import { initializeApp } from "firebase/app";
import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	sendEmailVerification,
	onAuthStateChanged,
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

// Auth functions
export const firebaseAuth = {
	// Get current user
	getCurrentUser: () => auth.currentUser,

	// Get ID token for API calls
	getIdToken: async () => {
		const user = auth.currentUser;
		if (!user) return null;
		return user.getIdToken();
	},

	// Sign up with email/password
	signUp: async (email, password) => {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		);
		// Send email verification
		await sendEmailVerification(userCredential.user);
		return userCredential.user;
	},

	// Sign in with email/password
	signIn: async (email, password) => {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password,
		);
		return userCredential.user;
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

	// Send email verification
	sendVerificationEmail: async () => {
		const user = auth.currentUser;
		if (user && !user.emailVerified) {
			await sendEmailVerification(user);
		}
	},

	// Check if email is verified
	isEmailVerified: () => {
		const user = auth.currentUser;
		return user?.emailVerified ?? false;
	},

	// Reload user to get latest email verification status
	reloadUser: async () => {
		const user = auth.currentUser;
		if (user) {
			await user.reload();
			return auth.currentUser;
		}
		return null;
	},

	// Listen to auth state changes
	onAuthStateChanged: (callback) => {
		return onAuthStateChanged(auth, callback);
	},
};

export { auth };
export default app;
