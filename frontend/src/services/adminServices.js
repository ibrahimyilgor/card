import api from "./api";

// Get list of all users with their plans
export const getUsers = (params = {}) => {
	const queryParams = new URLSearchParams();
	if (params.search) queryParams.append("search", params.search);
	if (params.page) queryParams.append("page", params.page);
	if (params.limit) queryParams.append("limit", params.limit);

	const queryString = queryParams.toString();
	return api.get(`/admin/users${queryString ? `?${queryString}` : ""}`);
};

// Get detailed information about a specific user
export const getUserDetails = (userId) => {
	return api.get(`/admin/users/${userId}`);
};

// Change a user's plan
export const changeUserPlan = (userId, planCode, reason = "admin_change") => {
	return api.put(`/admin/users/${userId}/plan`, { planCode, reason });
};

// Get all available plans
export const getPlans = () => {
	return api.get("/admin/plans");
};

// Get admin dashboard statistics
export const getAdminStats = () => {
	return api.get("/admin/stats");
};
