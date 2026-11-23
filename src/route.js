// Real URLs for the prototype's `view` state machine (PLAN.md §3, §5.2).
//
//   /                       landing        /login        login
//   /explore                explore        /new          onboarding
//   /me                     profile        /b/:code      request (basket link)
//   /dashboard/:tab         dashboard
//   /:handle                store          /:handle/p/:productId   store, product open
//   /:handle/link           bio
//
// App.jsx keeps its `view` state and every component prop; it only mirrors view ⇄ URL through this file.
// The prototype's own links (?view=, ?p=, ?b=, ?tab=) are rewritten to these paths on load (legacyPath).
import { useSyncExternalStore } from 'react';

const EVT = 'rasta-route';
const FIXED = { '': 'landing', explore: 'explore', login: 'login', new: 'onboarding', me: 'profile' };

export function parsePath(pathname) {
  const seg = pathname.replace(/\/+$/, '').split('/').slice(1).map(decodeURIComponent);
  const [a = '', b, c] = seg;
  if (seg.length <= 1 && a in FIXED) return { view: FIXED[a] };
  if (a === 'dashboard' && seg.length <= 2) return { view: 'dashboard', tab: b || null };
  if (a === 'b' && seg.length <= 2) return { view: 'request', code: b || null };
  if (seg.length === 1) return { view: 'store', handle: a };
  if (seg.length === 2 && b === 'link') return { view: 'bio', handle: a };
  if (seg.length === 3 && b === 'p') return { view: 'store', handle: a, productId: c };
  return { view: null };
}

export const currentRoute = () => parsePath(location.pathname);

const listeners = new Set();
function emit(external) {
  listeners.forEach(fn => fn(external));
}
addEventListener('popstate', () => emit(true));

// fn(external): external = true for Back/Forward and for navigation started outside App (go(path, {external:true}))
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Same path → nothing. A different page drops the query (filters belong to the page they were set on),
// except moving inside one shop (/lola ⇄ /lola/p/x), which keeps it.
export function go(path, { replace = false, external = false } = {}) {
  if (path === location.pathname) return;
  const shopOf = p => { const r = parsePath(p); return r.view === 'store' ? r.handle : null; };
  const keep = shopOf(path) && shopOf(path) === shopOf(location.pathname);
  const url = path + (keep ? location.search : '') + location.hash;
  if (replace) history.replaceState(history.state, '', url);
  else history.pushState({ from: location.pathname }, '', url);
  emit(external);
}

// Back to `path` if that is where we came from (a product opened from its shop), otherwise go there.
export function back(path) {
  if (history.state && history.state.from === path) history.back();
  else go(path);
}

export function useRoute() {
  const pathname = useSyncExternalStore(subscribe, () => location.pathname);
  return parsePath(pathname);
}

// ?view= / ?p= / ?b= / ?tab= (the prototype's links) → the real path; other query keys (filters) stay.
// handleOf(shopId) and shopOfProduct(productId) come from the shop store.
export function legacyPath({ currentHandle, handleOfProduct, anyCode }) {
  const q = new URLSearchParams(location.search);
  const v = q.get('view'), p = q.get('p'), b = q.get('b'), tab = q.get('tab');
  if (!v && !p && !b && !tab) return null;
  let path = null;
  if (b) path = '/b/' + encodeURIComponent(b);
  else if (v === 'dashboard' || (!v && tab)) path = '/dashboard' + (tab ? '/' + encodeURIComponent(tab) : '');
  else if (p && (!v || v === 'store')) { const h = handleOfProduct(p) || currentHandle; path = h ? `/${h}/p/${encodeURIComponent(p)}` : null; }
  else if (v === 'store') path = currentHandle ? '/' + currentHandle : null;
  else if (v === 'bio') path = currentHandle ? `/${currentHandle}/link` : null;
  else if (v === 'request') path = anyCode ? '/b/' + anyCode : '/b';
  else if (v === 'landing') path = '/';
  else if (v === 'explore') path = '/explore';
  else if (v === 'login') path = '/login';
  else if (v === 'onboarding') path = '/new';
  else if (v === 'profile') path = '/me';
  ['view', 'p', 'b', 'tab'].forEach(k => q.delete(k));
  const s = q.toString();
  return (path || location.pathname) + (s ? '?' + s : '');
}
