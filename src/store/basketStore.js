import { create } from 'zustand';

// The buyer's basket, one per shop, kept in localStorage. Lines are what the
// shop receives as a request: { productId, variantId, name, label, qty, unitPrice }.
const KEY = 'rasta_baskets';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};

const useBasketStore = create((set, get) => {
  const commit = (baskets) => {
    localStorage.setItem(KEY, JSON.stringify(baskets));
    set({ baskets });
  };
  return {
    baskets: load(),

    lines: (shopId) => get().baskets[shopId] || [],

    count: (shopId) => {
      const all = shopId ? [get().baskets[shopId] || []] : Object.values(get().baskets);
      return all.flat().reduce((n, l) => n + l.qty, 0);
    },

    add(shopId, line) {
      const cur = get().baskets[shopId] || [];
      const hit = cur.find((l) => l.variantId === line.variantId);
      const next = hit
        ? cur.map((l) => (l === hit ? { ...l, qty: l.qty + (line.qty || 1) } : l))
        : [...cur, { ...line, qty: line.qty || 1 }];
      commit({ ...get().baskets, [shopId]: next });
    },

    setQty(shopId, variantId, qty) {
      const cur = get().baskets[shopId] || [];
      const next = qty > 0
        ? cur.map((l) => (l.variantId === variantId ? { ...l, qty } : l))
        : cur.filter((l) => l.variantId !== variantId);
      commit({ ...get().baskets, [shopId]: next });
    },

    remove: (shopId, variantId) => get().setQty(shopId, variantId, 0),

    clear(shopId) {
      const { [shopId]: _gone, ...rest } = get().baskets;
      commit(rest);
    },
  };
});

export default useBasketStore;
