import api from './api';

export const getProfile = () =>
  api.get('/account/profile');

export const updateTheme = (theme_preference) =>
  api.put('/account/profile/theme', { theme_preference });

export const updateLanguage = (language) =>
  api.put('/account/profile/language', { language });
