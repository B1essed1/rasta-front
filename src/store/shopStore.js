import { create } from 'zustand';
import api from '../api/client';

// ---------------------------------------------------------------------------
// Dashboard home helpers (mirrors design-src/data2.jsx stockState/totalQty and
// design-src/Store.jsx orderCounts, but reads the real API DTO shapes)
// ---------------------------------------------------------------------------
export const DEFAULT_THRESHOLD = 3;
const DAY_MS = 86400000;

const ts = (v) => (v ? new Date(v).getTime() : 0);
const num = (v) => (v == null ? 0 : Number(v) || 0);

export function totalQty(product) {
  return (product?.variants || []).reduce((n, v) => n + Math.max(0, num(v.qty)), 0);
}

// "sold" | "low" | "in". Threshold precedence follows the design's stockState():
// the product's own threshold, then the shop default, then DEFAULT_THRESHOLD.
// Adaptation: ProductDto.Response carries no product-level threshold (only
// variants do), so when it is absent we fall back to the widest variant
// threshold before the shop default.
//
// This is the ONLY stockState in the app. Do not re-implement it in a view —
// Dashboard's Inventory badge and HomeView's attention list must agree.
export function stockState(product, threshold) {
  const q = totalQty(product);
  const vs = product?.variants || [];
  const variantTh = vs.length
    ? Math.max(...vs.map((v) => (v.threshold != null ? num(v.threshold) : DEFAULT_THRESHOLD)))
    : null;
  const th =
    product?.threshold != null
      ? num(product.threshold)
      : variantTh != null
        ? variantTh
        : threshold ?? DEFAULT_THRESHOLD;
  if (q <= 0) return 'sold';
  if (q <= th) return 'low';
  return 'in';
}

// The design calls a product "incomplete" when it has no description in any
// language. ProductDto.Response exposes descEn/descRu/descUz.
export function isIncomplete(product) {
  return !(product?.descEn || product?.descRu || product?.descUz);
}

const OPEN_ORDER_STATUSES = ['NEW', 'CONFIRMED', 'READY', 'OUT'];

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
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
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
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
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

  // NOTE: there is no GET /api/shops/{id}/stats on the backend (verified: 404,
  // code "request.endpoint.not.found"). Until it exists, the dashboard derives
  // everything it can from /products, /orders and /sales — see monthStats().
  async fetchStats() {
    try {
      const res = await api.get(`/shops/${get().shop.id}/stats`);
      set({ stats: res.data });
      return res.data;
    } catch (e) {
      set({ stats: null });
      return null;
    }
  },

  // --- dashboard home -------------------------------------------------------

  // One call for everything the Home tab needs. Failures are per-resource so a
  // single 4xx cannot blank the whole page.
  async fetchHome(shopId) {
    const id = shopId || get().shop?.id;
    if (!id) return;
    set({ loading: true });
    await Promise.allSettled([
      get().fetchProducts(id),
      get().fetchOrders(),
      get().fetchSales(),
      get().fetchConfig(),
    ]);
    set({ loading: false });
  },

  // { all, new, stale, open } — GET /api/shops/{id}/orders (OrderDto.Response:
  // status + createdAt). "stale" = still NEW after 24h.
  orderCounts() {
    const list = get().orders || [];
    const staleAfter = Date.now() - DAY_MS;
    return {
      all: list.length,
      new: list.filter((o) => o.status === 'NEW').length,
      stale: list.filter((o) => o.status === 'NEW' && ts(o.createdAt) && ts(o.createdAt) < staleAfter).length,
      open: list.filter((o) => OPEN_ORDER_STATUSES.includes(o.status)).length,
    };
  },

  // { soldOut, low, incomplete, total } — GET /api/shops/{id}/products
  // (ProductDto.VariantResponse: qty + threshold).
  stockCounts(threshold) {
    const list = get().products || [];
    const th = threshold ?? DEFAULT_THRESHOLD;
    return {
      total: list.length,
      soldOut: list.filter((p) => stockState(p, th) === 'sold').length,
      low: list.filter((p) => stockState(p, th) === 'low').length,
      incomplete: list.filter(isIncomplete).length,
    };
  },

  // Rolling 30-day figures for the four "THIS MONTH" tiles.
  //
  // Availability against the current API:
  //   revenue        AVAILABLE  — sum of SaleDto total over the window
  //   itemsSold      PARTIAL    — OrderDto.Response.items[].qty for confirmed /
  //                              ready / out / completed orders. POS sales made
  //                              through /sales are NOT counted because
  //                              OrderDto.SaleResponse carries no line items.
  //   visitors       MISSING    — nothing in the backend tracks shop views
  //   productViews   MISSING    — nothing in the backend tracks product views
  // The `available` map lets the view hide or zero-out what is not real yet.
  monthStats(days = 30) {
    const since = Date.now() - days * DAY_MS;
    const sales = (get().sales || []).filter(
      (s) => ts(s.createdAt) >= since && s.status !== 'CANCELLED'
    );
    const revenue = sales.reduce((n, s) => n + num(s.total), 0);

    const counted = ['CONFIRMED', 'READY', 'OUT', 'COMPLETED'];
    const itemsSold = (get().orders || [])
      .filter((o) => ts(o.createdAt) >= since && counted.includes(o.status))
      .reduce(
        (n, o) => n + (o.items || []).filter((l) => !l.dropped).reduce((m, l) => m + num(l.qty), 0),
        0
      );

    const s = get().stats;
    return {
      visitors: num(s?.visitors),
      productViews: num(s?.productViews),
      itemsSold,
      revenue,
      salesCount: sales.length,
      available: {
        visitors: s?.visitors != null,
        productViews: s?.productViews != null,
        itemsSold: true,
        revenue: true,
      },
    };
  },

  // { status, live, handle, url, publicUrl } — GET /api/shops/mine
  // (ShopDto.Response: status LIVE|PAUSED|DRAFT, handle).
  shopPresence() {
    const shop = get().shop;
    const status = shop?.status || 'DRAFT';
    const handle = shop?.handle || '';
    return {
      status,
      live: status === 'LIVE',
      handle,
      url: handle ? `rasta.uz/${handle}` : '',
      publicUrl: handle ? `${window.location.origin}/${handle}` : '',
    };
  },

  // Publish / pause / unpublish — PUT /api/shops/{id} with { status }.
  async setShopStatus(status) {
    const id = get().shop?.id;
    if (!id) return null;
    const res = await api.put(`/shops/${id}`, { status: String(status).toUpperCase() });
    set({ shop: res.data });
    return res.data;
  },

  async publishShop() {
    return get().setShopStatus('LIVE');
  },

  async uploadImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/media', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  },

  // Images can only be attached once the product (and its variants) have ids,
  // so the modal holds them until save and then reconciles here.
  async syncProductImages(productId, { add = [], removeIds = [] }) {
    const shopId = get().shop.id;
    for (const imageId of removeIds) {
      await api.delete(`/shops/${shopId}/products/${productId}/images/${imageId}`);
    }
    for (const img of add) {
      await api.post(`/shops/${shopId}/products/${productId}/images`, null, {
        params: { url: img.url, variantId: img.variantId || undefined },
      });
    }
    try {
      const res = await api.get(`/shops/${shopId}/products/${productId}`);
      set({
        products: get().products.map((p) => (p.id === productId ? res.data : p)),
      });
    } catch { /* product list will refresh on next navigation */ }
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
