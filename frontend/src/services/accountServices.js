import api from "./api";

// Account profile endpoint
export const getProfile = () => api.get("/account/profile");

// Get current user info including role
export const getMe = () => api.get("/account/me");

export const updateTheme = (theme_preference, accountId) =>
	api.put("/account/profile/theme", { theme_preference, accountId });

export const updateLanguage = (language, accountId) =>
	api.put("/account/profile/language", { language, accountId });

export const updateSoundEffects = (sound_effects_enabled, accountId) =>
	api.put("/account/profile/sound", { sound_effects_enabled, accountId });

export const updateKeyboardShortcuts = (
	keyboard_shortcuts_enabled,
	accountId,
) =>
	api.put("/account/profile/keyboard", {
		keyboard_shortcuts_enabled,
		accountId,
	});

// Plans
export const getAllPlans = () => api.get("/account/plans");
export const getMyPlan = () => api.get("/account/my-plan");
export const getLimitStatus = () => api.get("/account/limit-status");

// Reset statistics
export const resetStatistics = () => api.delete("/stats/reset");
