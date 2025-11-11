import api from './api';

export const login = (accountname, password) =>
  api.post('/auth/login', { accountname, password });

export const register = (accountname, password) =>
  api.post('/auth/register', { accountname, password });
