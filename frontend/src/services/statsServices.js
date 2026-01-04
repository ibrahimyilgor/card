import api from './api';

// Get comprehensive overview stats
export const getOverviewStats = async () => {
    const response = await api.get('/stats/overview');
    return response.data;
};

// Get daily activity for charts
export const getDailyStats = async (period = '30d', startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
    } else if (period) {
        params.append('period', period);
    }
    const response = await api.get(`/stats/daily?${params.toString()}`);
    return response.data;
};

// Get all decks performance
export const getDecksStats = async () => {
    const response = await api.get('/stats/decks');
    return response.data;
};

// Get specific deck detailed stats
export const getDeckStats = async (deckId, period = null) => {
    const params = period ? `?period=${period}` : '';
    const response = await api.get(`/stats/deck/${deckId}${params}`);
    return response.data;
};

// Get card-level stats for a deck
export const getCardStats = async (deckId, sort = 'id', order = 'asc') => {
    const response = await api.get(`/stats/cards/${deckId}?sort=${sort}&order=${order}`);
    return response.data;
};

// Record a study session
export const recordSession = async (sessionData) => {
    const response = await api.post('/stats/session', sessionData);
    return response.data;
};

// Get activity heatmap data
export const getHeatmapData = async () => {
    const response = await api.get('/stats/heatmap');
    return response.data;
};

// Get time-based insights
export const getInsights = async () => {
    const response = await api.get('/stats/insights');
    return response.data;
};
