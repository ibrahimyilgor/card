import api from "./api";

// Get all achievements with user's earned status
export const getAchievements = async () => {
	const response = await api.get("/achievements");
	return response.data;
};

// Check and award achievements after game completion
export const checkAchievements = async (sessionData) => {
	const response = await api.post("/achievements/check", sessionData);
	return response.data;
};
