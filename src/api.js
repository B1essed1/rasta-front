// ===== rastashops API client (BACKEND-PLAN §14) =====
// Access token in memory (15 min), refreshed from the HttpOnly refresh cookie. Errors carry the server's stable
// `code` (e.g. "barcode.taken"), which the UI shows as a toast. The prototype's files read this as window.Api.

const BASE = '/api/v1';
const VISITOR_KEY = 'rasta.visitor';
const subs = new Set();

function visitorId() {
  try {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(VISITOR_KEY, v); }
    return v;
  } catch (e) { return 'anon'; }
}

export class ApiError extends Error {
  constructor(status, code, details) {
    super(code || ('http ' + status));
    this.status = status;
    this.code = code || ('http.' + status);
    this.details = details;
  }
}

const Api = {
  token: null,
  me: null,               // { account, shops } of the logged-in person, or null
  operator: {},           // shopId → till operator token (X-Operator)
  branch: {},             // shopId → branch id (X-Branch); none = default branch
  ready: false,           // session restore finished

  onAuth(fn) { subs.add(fn); return () => subs.delete(fn); },
  emit() { subs.forEach(f => { try { f(Api.me); } catch (e) { console.error(e); } }); },

  setSession(res) {
    Api.token = res && res.accessToken || null;
    Api.me = res && res.me || null;
    Api.emit();
  },
  setMe(me) { Api.me = me; Api.emit(); },
  clear() { Api.token = null; Api.me = null; Api.operator = {}; Api.emit(); },

  async restore() {
    try {
      const res = await Api.raw('POST', '/auth/refresh', null, { noRetry: true });
      Api.setSession(res);
    } catch (e) {
      Api.token = null; Api.me = null;
    }
    Api.ready = true;
    Api.emit();
    return Api.me;
  },

  async refresh() {
    try {
      const res = await Api.raw('POST', '/auth/refresh', null, { noRetry: true });
      Api.token = res.accessToken;
      if (res.me) Api.me = res.me;
      return true;
    } catch (e) {
      Api.clear();
      return false;
    }
  },

  async raw(method, path, body, opts = {}) {
    const headers = { 'X-Visitor': visitorId() };
    if (Api.token) headers.Authorization = 'Bearer ' + Api.token;
    const m = /^\/dash\/([^/]+)/.exec(path);
    if (m && Api.operator[m[1]]) headers['X-Operator'] = Api.operator[m[1]];
    if (m && Api.branch[m[1]]) headers['X-Branch'] = Api.branch[m[1]];
    let payload;
    if (body instanceof FormData) payload = body;
    else if (body !== undefined && body !== null) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
    let res;
    try {
      res = await fetch(BASE + path, { method, headers, body: payload, credentials: 'include' });
    } catch (e) {
      if (!opts.noRetry && !opts.retried) {   // one retry on a dropped connection (weak internet)
        await new Promise(r => setTimeout(r, 800));
        return Api.raw(method, path, body, { ...opts, retried: true });
      }
      throw new ApiError(0, 'network');
    }
    if (res.status === 401 && !opts.noRetry && !opts.refreshed && path.indexOf('/auth/') !== 0) {
      if (await Api.refresh()) return Api.raw(method, path, body, { ...opts, refreshed: true });
    }
    if (res.status === 204) return null;
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
    if (!res.ok) throw new ApiError(res.status, data && data.code, data && data.details);
    return data;
  },

  get(path) { return Api.raw('GET', path); },
  post(path, body) { return Api.raw('POST', path, body || {}); },
  put(path, body) { return Api.raw('PUT', path, body || {}); },
  patch(path, body) { return Api.raw('PATCH', path, body || {}); },
  del(path) { return Api.raw('DELETE', path); },

  async upload(file, shopId) {
    const fd = new FormData();
    fd.append('file', file, 'photo.jpg');
    return Api.raw('POST', '/media' + (shopId ? '?shopId=' + encodeURIComponent(shopId) : ''), fd);
  },

  async logout() {
    try { await Api.raw('POST', '/auth/logout', null, { noRetry: true }); } catch (e) { /* offline: still log out here */ }
    Api.clear();
  },

  /** A toast text for an API error (code → i18n key when the prototype has one). */
  errorText(e, lang) {
    const t = (window.I18N && window.I18N[lang || window.__lang || 'uz']) || {};
    const code = e && e.code || 'server.error';
    const map = {
      network: t.api_network, 'barcode.taken': t.api_barcode_taken, 'handle.taken': t.api_handle_taken,
      'request.variant_gone': t.api_gone, 'stock.variant_gone': t.api_gone, 'pin.wrong': t.tm_wrong_pin,
      'auth.required': t.api_login, 'rate.limited': t.api_slow_down, 'shop.paused': t.api_paused,
    };
    return map[code] || ((t.api_failed || 'Something went wrong') + ' (' + code + ')');
  },
};

window.Api = Api;
window.ApiError = ApiError;
export default Api;
