import axios from "axios";
import { firebaseAuth } from "../config/firebase";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
	baseURL: baseURL,
});

// Add Firebase token to requests
api.interceptors.request.use(async (config) => {
	try {
		const token = await firebaseAuth.getIdToken();
		if (token) {
			config.headers.Authorization = "Bearer " + token;
		}
	} catch (error) {
		// User not logged in or token error - continue without token
		console.debug("No auth token available:", error.message);
	}
	return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const isAuthRequest = originalRequest?.url?.includes("/auth/");

		// Handle 401 errors (token expired or invalid)
		if (
			error.response?.status === 401 &&
			!isAuthRequest &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;

			try {
				// Firebase automatically refreshes tokens, just get a new one
				const user = firebaseAuth.getCurrentUser();
				if (user) {
					// Force token refresh
					const newToken = await user.getIdToken(true);
					originalRequest.headers.Authorization = "Bearer " + newToken;
					return api(originalRequest);
				}
			} catch (refreshError) {
				console.error("Token refresh failed:", refreshError);
			}

			// No valid user - redirect to login
			localStorage.removeItem("accountId");
			window.location.href = "/session-expired";
		}

		// Handle 403 with EMAIL_NOT_VERIFIED code
		if (
			error.response?.status === 403 &&
			error.response?.data?.code === "EMAIL_NOT_VERIFIED"
		) {
			window.location.href = "/verify-email";
			return Promise.reject(error);
		}

		return Promise.reject(error);
	},
);

export default api;
