import { create } from 'zustand';
import api from '../api/client';

export const useShopStore = create((set, get) => ({
  shop: null,
  config: null,
  products: [],
  orders: [],
  sales: [],
  reviews: [],
  stats: null,
  loading: false,
  error: null,

  async fetchShop(shopId) {
    set({ loading: true });
    try {
      const res = await api.get(`/shops/${shopId}`);
      set({ shop: res.data, loading: false });
      return res.data;
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message });
      throw e;
    }
  },

  async fetchMyShops() {
    try {
      const res = await api.get('/shops/mine');
      // Backend returns a single shop; wrap in array for consistency
      return res.data ? [res.data] : [];
    } catch (e) {
      return [];
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
      const shopPayload = {
        handle: data.handle,
        name: data.name,
        location: data.city || data.location,
        type: data.type || undefined,
        coverColor: data.coverColor,
        instagram: data.instagram,
        telegram: data.telegram,
        phone: data.phone,
      };
      const res = await api.post('/shops', shopPayload);
      const shop = res.data;

      if (data.plan && data.plan !== 'starter') {
        await api.put(`/shops/${shop.id}`, { plan: data.plan.toUpperCase() });
      }

      if (data.themeId || data.paletteId) {
        await api.put(`/shops/${shop.id}/config`, {
          theme: data.themeId ? data.themeId.toUpperCase() : undefined,
          palette: data.paletteId,
        });
      }

      set({ shop, loading: false });
      return shop;
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message });
      throw e;
    }
  },

  async updateShop(data) {
    set({ loading: true });
    try {
      const payload = {
        name: data.name,
        location: data.city || data.location,
        type: data.type || undefined,
        coverColor: data.coverColor,
        instagram: data.instagram,
        telegram: data.telegram,
        phone: data.phone,
      };
      const res = await api.put(`/shops/${get().shop.id}`, payload);
      set({ shop: res.data, loading: false });
      return res.data;
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message });
      throw e;
    }
  },

  async fetchConfig() {
    try {
      const shopId = get().shop?.id;
      if (!shopId) return;
      const res = await api.get(`/shops/${shopId}/config`);
      set({ config: res.data });
      return res.data;
    } catch (e) {
      console.error(e);
    }
  },

  async updateConfig(data) {
    try {
      const shopId = get().shop?.id;
      if (!shopId) return;
      const payload = {
        theme: data.theme || (data.themeId ? data.themeId.toUpperCase() : undefined),
        palette: data.palette || data.paletteId,
        layout: data.layout ? data.layout.toUpperCase() : undefined,
        font: data.font || data.fontId,
      };
      const res = await api.put(`/shops/${shopId}/config`, payload);
      set({ config: res.data });
      return res.data;
    } catch (e) {
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
      const payload = {
        nameEn: data.nameEn || data.name,
        nameRu: data.nameRu,
        nameUz: data.nameUz,
        descEn: data.descEn || data.description,
        descRu: data.descRu,
        descUz: data.descUz,
        catId: data.catId || data.category,
        price: data.price,
        visible: data.visible,
        sortOrder: data.sortOrder,
        tone: data.tone,
        variants: data.variants?.map((v) => ({
          optionsJson: v.optionsJson || v.label,
          qty: v.qty ?? v.stock ?? 0,
          barcode: v.barcode,
          avgCost: v.avgCost,
          threshold: v.threshold,
        })),
      };
      const res = await api.post(`/shops/${get().shop.id}/products`, payload);
      set({ products: [...get().products, res.data] });
      return res.data;
    } catch (e) {
      throw e;
    }
  },

  async updateProduct(id, data) {
    try {
      const payload = {
        nameEn: data.nameEn || data.name,
        nameRu: data.nameRu,
        nameUz: data.nameUz,
        descEn: data.descEn || data.description,
        descRu: data.descRu,
        descUz: data.descUz,
        catId: data.catId || data.category,
        price: data.price,
        visible: data.visible,
        sortOrder: data.sortOrder,
        tone: data.tone,
        variants: data.variants?.map((v) => ({
          id: v.id,
          optionsJson: v.optionsJson || v.label,
          qty: v.qty ?? v.stock ?? 0,
          barcode: v.barcode,
          avgCost: v.avgCost,
          threshold: v.threshold,
        })),
      };
      const res = await api.put(`/shops/${get().shop.id}/products/${id}`, payload);
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

  async updateOrderStatus(orderId, status, reason) {
    try {
      const shopId = get().shop.id;
      const upperStatus = status.toUpperCase();
      let res;
      if (upperStatus === 'CONFIRMED') {
        res = await api.put(`/shops/${shopId}/orders/${orderId}/confirm`);
      } else if (upperStatus === 'CANCELLED') {
        res = await api.put(`/shops/${shopId}/orders/${orderId}/cancel`, {
          reason: reason || 'Cancelled',
          cancelledBy: 'shop',
        });
      } else {
        res = await api.put(`/shops/${shopId}/orders/${orderId}/status`, {
          status: upperStatus,
        });
      }
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
      set({ stats: { visitors: 0, itemsSold: 0, revenue: 0 } });
    }
  },

  async uploadImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/media', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  },

  async fetchAllShops(params) {
    try {
      if (params?.search) {
        const res = await api.get('/marketplace/search', {
          params: { q: params.search },
        });
        return res.data;
      }
      const res = await api.get('/marketplace/discover', {
        params: { type: params?.type || undefined },
      });
      return res.data;
    } catch (e) {
      return [];
    }
  },

  async createOrder(shopId, orderData) {
    try {
      const res = await api.post(`/shops/${shopId}/orders`, orderData);
      return res.data;
    } catch (e) {
      throw e;
    }
  },

  async restockVariant(variantId, productId, qty, unitCost, note) {
    try {
      const shopId = get().shop.id;
      await api.post(`/shops/${shopId}/inventory/restock`, {
        variantId,
        productId,
        qty,
        unitCost: unitCost || null,
        note: note || '',
      });
      await get().fetchProducts(shopId);
    } catch (e) {
      throw e;
    }
  },

  async adjustStock(variantId, productId, delta, reason, note) {
    try {
      const shopId = get().shop.id;
      await api.post(`/shops/${shopId}/inventory/adjust`, {
        variantId,
        productId,
        delta,
        reason: reason || 'CORRECTION',
        note: note || '',
      });
      await get().fetchProducts(shopId);
    } catch (e) {
      throw e;
    }
  },
}));
