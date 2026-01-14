import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
	baseURL: baseURL,
});

// Add token
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = "Bearer " + token;
	return config;
});

// Response interceptor - refresh token on 401
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const isAuthRequest = originalRequest?.url?.includes("/auth/");

		// Try to refresh token on 401 (but not for auth requests)
		if (
			error.response?.status === 401 &&
			!isAuthRequest &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem("refreshToken");

				if (refreshToken) {
					// Try to refresh the access token
					const response = await axios.post(`${baseURL}/auth/refresh`, {
						refreshToken,
					});
					const { token } = response.data;

					// Store new access token
					localStorage.setItem("token", token);

					// Retry original request with new token
					originalRequest.headers.Authorization = "Bearer " + token;
					return api(originalRequest);
				}
			} catch (refreshError) {
				// Refresh failed - clear auth and redirect
				localStorage.removeItem("token");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("accountId");
				window.location.href = "/session-expired";
				return Promise.reject(refreshError);
			}

			// No refresh token available - redirect to session expired
			localStorage.removeItem("token");
			localStorage.removeItem("refreshToken");
			localStorage.removeItem("accountId");
			window.location.href = "/session-expired";
		}
		return Promise.reject(error);
	}
);

export default api;
