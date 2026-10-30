import { create } from 'zustand';
import api from '../api/client';

const useBuyerStore = create((set, get) => ({
  profile: null,
  addresses: [],
  favourites: [],
  orders: [],
  loading: false,

  fetchProfile: async () => {
    try {
      const res = await api.get('/buyer/me');
      set({ profile: res.data });
    } catch (e) { console.error('fetchProfile', e); }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put('/buyer/me', data);
      set({ profile: res.data });
    } catch (e) { throw e; }
  },

  fetchAddresses: async () => {
    try {
      const res = await api.get('/buyer/me/addresses');
      set({ addresses: Array.isArray(res.data) ? res.data : [] });
    } catch (e) { console.error('fetchAddresses', e); }
  },

  addAddress: async (data) => {
    try {
      const res = await api.post('/buyer/me/addresses', data);
      get().fetchAddresses();
      return res.data;
    } catch (e) { throw e; }
  },

  updateAddress: async (id, data) => {
    try {
      await api.put(`/buyer/me/addresses/${id}`, data);
      get().fetchAddresses();
    } catch (e) { throw e; }
  },

  deleteAddress: async (id) => {
    try {
      await api.delete(`/buyer/me/addresses/${id}`);
      get().fetchAddresses();
    } catch (e) { throw e; }
  },

  setDefaultAddress: async (id) => {
    try {
      await api.put(`/buyer/me/addresses/${id}/default`);
      get().fetchAddresses();
    } catch (e) { throw e; }
  },

  fetchFavourites: async () => {
    try {
      const res = await api.get('/buyer/me/favourites');
      set({ favourites: Array.isArray(res.data) ? res.data : [] });
    } catch (e) { console.error('fetchFavourites', e); }
  },

  addFavourite: async (shopId) => {
    try {
      await api.post(`/buyer/me/favourites/${shopId}`);
      get().fetchFavourites();
    } catch (e) { throw e; }
  },

  removeFavourite: async (shopId) => {
    try {
      await api.delete(`/buyer/me/favourites/${shopId}`);
      get().fetchFavourites();
    } catch (e) { throw e; }
  },

  fetchOrders: async () => {
    try {
      const res = await api.get('/buyer/me/orders');
      set({ orders: Array.isArray(res.data) ? res.data : [] });
    } catch (e) { console.error('fetchOrders', e); }
  },
}));

export default useBuyerStore;
