import { create } from 'zustand';
import api from '../api/client';

// The favourites payload is {id, handle, name, ...}; older builds sent
// {shopId, shopName, shopHandle, ...}. Normalise so the UI reads one shape.
const normShop = (f) => ({
  id: f.id && !f.shopId ? f.id : f.shopId,
  handle: f.handle ?? f.shopHandle,
  name: f.name ?? f.shopName,
  location: f.location ?? f.shopLocation,
  type: f.type ?? f.shopType,
  rating: f.rating ?? f.shopRating,
  logoUrl: f.logoUrl,
  coverUrl: f.coverUrl,
  coverColor: f.coverColor,
  initials: f.initials,
});

const useBuyerStore = create((set, get) => ({
  profile: null,
  addresses: [],
  favourites: [],
  favIds: [],
  favLoaded: false,
  reviews: [],
  loading: false,

  clear: () => set({ profile: null, addresses: [], favourites: [], favIds: [], favLoaded: false, reviews: [] }),

  fetchProfile: async () => {
    try {
      const res = await api.get('/buyer/me');
      set({ profile: res.data });
    } catch (e) { console.error('fetchProfile', e); }
  },

  updateProfile: async (data) => {
    const res = await api.put('/buyer/me', data);
    set({ profile: res.data });
  },

  fetchAddresses: async () => {
    try {
      const res = await api.get('/buyer/me/addresses');
      set({ addresses: Array.isArray(res.data) ? res.data : [] });
    } catch (e) { console.error('fetchAddresses', e); }
  },

  addAddress: async (data) => {
    const res = await api.post('/buyer/me/addresses', data);
    get().fetchAddresses();
    return res.data;
  },

  updateAddress: async (id, data) => {
    await api.put(`/buyer/me/addresses/${id}`, data);
    get().fetchAddresses();
  },

  deleteAddress: async (id) => {
    await api.delete(`/buyer/me/addresses/${id}`);
    get().fetchAddresses();
  },

  setDefaultAddress: async (id) => {
    await api.put(`/buyer/me/addresses/${id}/default`);
    get().fetchAddresses();
  },

  fetchFavourites: async () => {
    try {
      const res = await api.get('/buyer/me/favourites');
      const list = (Array.isArray(res.data) ? res.data : []).map(normShop);
      set({ favourites: list, favIds: list.map((s) => s.id), favLoaded: true });
    } catch (e) { console.error('fetchFavourites', e); }
  },

  // Optimistic: the heart flips at once, the list is reconciled from the server.
  // Returns true when the shop is now a favourite.
  toggleFavourite: async (shopId) => {
    const on = get().favIds.includes(shopId);
    set({ favIds: on ? get().favIds.filter((x) => x !== shopId) : [...get().favIds, shopId] });
    try {
      if (on) await api.delete(`/buyer/me/favourites/${shopId}`);
      else await api.post(`/buyer/me/favourites/${shopId}`);
      get().fetchFavourites();
      return !on;
    } catch (e) {
      set({ favIds: on ? [...get().favIds, shopId] : get().favIds.filter((x) => x !== shopId) });
      throw e;
    }
  },

  fetchReviews: async () => {
    try {
      const res = await api.get('/buyer/me/reviews');
      set({ reviews: Array.isArray(res.data) ? res.data : [] });
    } catch (e) { console.error('fetchReviews', e); }
  },
}));

export default useBuyerStore;
