import axios from "axios";

const baseURL =
	window.location.protocol + "//" + window.location.hostname + ":5000";

const api = axios.create({
	baseURL: baseURL,
});
// Add token
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) config.headers.Authorization = "Bearer " + token;
	return config;
});

// Logout if token is invalid
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/session-expired";
		}
		return Promise.reject(error);
	}
);

export default api;
