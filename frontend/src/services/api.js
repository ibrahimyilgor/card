import axios from "axios";

const hostname = window.location.host.split(":")[0];
const baseURL = window.location.protocol + "//" + hostname + "/auth";

const api = axios.create({
	baseURL: baseURL,
});
// Add token
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = "Bearer " + token;
	return config;
});

// Logout if token is invalid (but not for login/register requests)
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const isAuthRequest = error.config?.url?.includes("/auth/");
		if (error.response && error.response.status === 401 && !isAuthRequest) {
			localStorage.removeItem("token");
			window.location.href = "/session-expired";
		}
		return Promise.reject(error);
	}
);

export default api;
