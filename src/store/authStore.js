import { create } from 'zustand';
import api from '../api/client';

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('rasta_token') || null,
  user: JSON.parse(localStorage.getItem('rasta_user') || 'null'),
  loading: false,
  error: null,

  setToken(token) {
    localStorage.setItem('rasta_token', token);
    set({ token });
  },

  setUser(user) {
    localStorage.setItem('rasta_user', JSON.stringify(user));
    set({ user });
  },

  async sendOtp(phone) {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/send-code', { phone });
      set({ loading: false });
      return res.data;
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || 'Error' });
      throw e;
    }
  },

  async verifyOtp(phone, code) {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/verify', { phone, code });
      const { token, user } = res.data;
      localStorage.setItem('rasta_token', token);
      localStorage.setItem('rasta_user', JSON.stringify(user));
      set({ token, user, loading: false });
      return res.data;
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || 'Invalid code' });
      throw e;
    }
  },

  logout() {
    localStorage.removeItem('rasta_token');
    localStorage.removeItem('rasta_user');
    set({ token: null, user: null });
  },
}));
