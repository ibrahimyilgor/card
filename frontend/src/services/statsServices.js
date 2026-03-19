import api from "./api";

const getClientTimezone = () => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
};

const appendClientTimeContext = (params) => {
	params.append("timezone", getClientTimezone());
	params.append("timezoneOffsetMinutes", String(-new Date().getTimezoneOffset()));
};

// Get current streak (lightweight, used by Topbar)
export const getCurrentStreak = async () => {
	const params = new URLSearchParams();
	appendClientTimeContext(params);
	const response = await api.get(`/stats/streak?${params.toString()}`);
	return response.data;
};

// Get comprehensive overview stats
export const getOverviewStats = async () => {
	const params = new URLSearchParams();
	appendClientTimeContext(params);
	const response = await api.get(`/stats/overview?${params.toString()}`);
	return response.data;
};

// Get daily activity for charts
export const getDailyStats = async (
	period = "30d",
	startDate = null,
	endDate = null,
) => {
	const params = new URLSearchParams();
	if (startDate && endDate) {
		params.append("startDate", startDate);
		params.append("endDate", endDate);
	} else if (period) {
		params.append("period", period);
	}
	appendClientTimeContext(params);
	const response = await api.get(`/stats/daily?${params.toString()}`);
	return response.data;
};

// Get all decks performance
export const getDecksStats = async () => {
	const response = await api.get("/stats/decks");
	return response.data;
};

// Get specific deck detailed stats
export const getDeckStats = async (deckId, period = null) => {
	const params = period ? `?period=${period}` : "";
	const response = await api.get(`/stats/deck/${deckId}${params}`);
	return response.data;
};

// Get card-level stats for a deck
export const getCardStats = async (deckId, sort = "id", order = "asc") => {
	const response = await api.get(
		`/stats/cards/${deckId}?sort=${sort}&order=${order}`,
	);
	return response.data;
};

// Record a study session
export const recordSession = async (sessionData) => {
	const response = await api.post("/stats/session", sessionData);
	return response.data;
};

// Get activity heatmap data
export const getHeatmapData = async () => {
	const params = new URLSearchParams();
	appendClientTimeContext(params);
	const response = await api.get(`/stats/heatmap?${params.toString()}`);
	return response.data;
};

// Get time-based insights
export const getInsights = async () => {
	const params = new URLSearchParams();
	appendClientTimeContext(params);
	const response = await api.get(`/stats/insights?${params.toString()}`);
	return response.data;
};

// NEW: Get filtered stats summary for overview cards
export const getFilteredStats = async (
	deckId = "all",
	startDate = null,
	endDate = null,
) => {
	const params = new URLSearchParams();
	params.append("deckId", deckId);
	if (startDate) params.append("startDate", startDate);
	if (endDate) params.append("endDate", endDate);
	appendClientTimeContext(params);
	const response = await api.get(`/stats/filtered?${params.toString()}`);
	return response.data;
};

// NEW: Get chart data with auto-grouping (daily/monthly)
export const getChartData = async (
	deckId = "all",
	startDate = null,
	endDate = null,
) => {
	const params = new URLSearchParams();
	params.append("deckId", deckId);
	if (startDate) params.append("startDate", startDate);
	if (endDate) params.append("endDate", endDate);
	appendClientTimeContext(params);
	const response = await api.get(`/stats/chart-data?${params.toString()}`);
	return response.data;
};

// NEW: Get cards table with sorting
export const getCardsTable = async (
	deckId = "all",
	sort = "times_played",
	order = "desc",
) => {
	const params = new URLSearchParams();
	params.append("deckId", deckId);
	params.append("sort", sort);
	params.append("order", order);
	const response = await api.get(`/stats/cards-table?${params.toString()}`);
	return response.data;
};
