import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rasta_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lang = localStorage.getItem('rasta_lang') || 'uz';
  config.headers['Accept-Language'] = lang;
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.data && res.data.data !== undefined) {
      res.data = res.data.data;
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rasta_token');
      localStorage.removeItem('rasta_user');
      window.location.href = '/login';
    }
    if (err.response?.data) {
      err.serverMessage = err.response.data.message || null;
      err.serverCode = err.response.data.code || null;
    }
    return Promise.reject(err);
  }
);

export default api;
