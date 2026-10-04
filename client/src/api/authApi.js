import http from './http.js';

export const authApi = {
  register: async (payload) => http.post('/auth/register', payload),
  login: async (payload) => http.post('/auth/login', payload),
  me: async () => http.get('/auth/me'),
};

export default authApi;
