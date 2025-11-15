import api from './api';

export const getProfile = (accountId) =>
  api.post('/account/profile', { accountId });

export const updateTheme = (theme_preference, accountId) =>
  api.put('/account/profile/theme', { theme_preference, accountId });

export const updateLanguage = (language, accountId) =>
  api.put('/account/profile/language', { language, accountId });