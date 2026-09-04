import { create } from 'zustand';
import api from '../api/client';

export const useShopStore = create((set, get) => ({
  shop: null,
  products: [],
  orders: [],
  sales: [],
  reviews: [],
  stats: null,
  loading: false,
  error: null,

  async fetchShop() {
    set({ loading: true });
    try {
      const res = await api.get('/shops/mine');
      set({ shop: res.data, loading: false });
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message });
    }
  },

  async fetchShopByHandle(handle) {
    set({ loading: true });
    try {
      const res = await api.get(`/shops/${handle}`);
      set({ shop: res.data, loading: false });
      return res.data;
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message });
      throw e;
    }
  },

  async createShop(data) {
    set({ loading: true });
    try {
      const res = await api.post('/shops', data);
      set({ shop: res.data, loading: false });
      return res.data;
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message });
      throw e;
    }
  },

  async updateShop(data) {
    set({ loading: true });
    try {
      const res = await api.put(`/shops/${get().shop.id}`, data);
      set({ shop: res.data, loading: false });
      return res.data;
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message });
      throw e;
    }
  },

  async fetchProducts(shopId) {
    try {
      const res = await api.get(`/shops/${shopId || get().shop?.id}/products`);
      set({ products: res.data });
    } catch (e) {
      console.error(e);
    }
  },

  async createProduct(data) {
    try {
      const res = await api.post(`/shops/${get().shop.id}/products`, data);
      set({ products: [...get().products, res.data] });
      return res.data;
    } catch (e) {
      throw e;
    }
  },

  async updateProduct(id, data) {
    try {
      const res = await api.put(`/shops/${get().shop.id}/products/${id}`, data);
      set({
        products: get().products.map((p) => (p.id === id ? res.data : p)),
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/shops/${get().shop.id}/products/${id}`);
      set({ products: get().products.filter((p) => p.id !== id) });
    } catch (e) {
      throw e;
    }
  },

  async reorderProducts(ids) {
    try {
      await api.put(`/shops/${get().shop.id}/products/reorder`, { ids });
    } catch (e) {
      console.error(e);
    }
  },

  async fetchOrders() {
    try {
      const res = await api.get(`/shops/${get().shop.id}/orders`);
      set({ orders: res.data });
    } catch (e) {
      console.error(e);
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const res = await api.put(`/shops/${get().shop.id}/orders/${orderId}`, { status });
      set({
        orders: get().orders.map((o) => (o.id === orderId ? res.data : o)),
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  },

  async fetchSales() {
    try {
      const res = await api.get(`/shops/${get().shop.id}/sales`);
      set({ sales: res.data });
    } catch (e) {
      console.error(e);
    }
  },

  async fetchReviews() {
    try {
      const res = await api.get(`/shops/${get().shop.id}/reviews`);
      set({ reviews: res.data });
    } catch (e) {
      console.error(e);
    }
  },

  async fetchStats() {
    try {
      const res = await api.get(`/shops/${get().shop.id}/stats`);
      set({ stats: res.data });
    } catch (e) {
      console.error(e);
    }
  },

  async uploadImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/uploads', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  },

  async fetchAllShops(params) {
    try {
      const res = await api.get('/shops', { params });
      return res.data;
    } catch (e) {
      return [];
    }
  },
}));
