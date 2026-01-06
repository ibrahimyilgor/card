import api from "./api";

// Account info endpoint (name and created_at)
export const getAccountInfo = () => api.get("/account/me");

// Change password
export const changePassword = (oldPassword, newPassword, newPasswordRepeat) =>
	api.post("/account/change-password", {
		oldPassword,
		newPassword,
		newPasswordRepeat,
	});

export const getProfile = () => api.get("/account/profile");

export const updateTheme = (theme_preference, accountId) =>
	api.put("/account/profile/theme", { theme_preference, accountId });

export const updateLanguage = (language, accountId) =>
	api.put("/account/profile/language", { language, accountId });

export const updateSoundEffects = (sound_effects_enabled, accountId) =>
	api.put("/account/profile/sound", { sound_effects_enabled, accountId });

export const updateKeyboardShortcuts = (
	keyboard_shortcuts_enabled,
	accountId
) =>
	api.put("/account/profile/keyboard", {
		keyboard_shortcuts_enabled,
		accountId,
	});

// Plans
export const getAllPlans = () => api.get("/account/plans");
export const getMyPlan = () => api.get("/account/my-plan");
