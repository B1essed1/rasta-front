// Remembers which shop a basket belongs to (name, handle, contacts), so the basket
// drawer can show it without another request. Written by the storefront.
const KEY = 'rasta_basket_shops';

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};

export function rememberShop(shop) {
  if (!shop?.id) return;
  const all = read();
  all[shop.id] = {
    id: shop.id, name: shop.name, handle: shop.handle,
    telegram: shop.telegram || '', phone: shop.phone || '', logoUrl: shop.logoUrl || '',
  };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage full */ }
}

export const shopMeta = (id) => read()[id] || { id, name: '', handle: '' };
