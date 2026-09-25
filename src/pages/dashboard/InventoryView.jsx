import React, { useState, useEffect, useMemo, useRef } from 'react';
import { t, onLangChange, fmtPrice, getLang } from '../../i18n';
import { useShopStore, DEFAULT_THRESHOLD } from '../../store/shopStore';
import { I } from '../../components/ui/Icons';
import { toast } from '../../components/ui/ToastHost';

/* ───────────────────────── helpers ───────────────────────── */

function getProductName(p) {
  const lang = getLang();
  if (lang === 'uz') return p.nameUz || p.nameEn || p.nameRu || '';
  if (lang === 'ru') return p.nameRu || p.nameEn || p.nameUz || '';
  return p.nameEn || p.nameUz || p.nameRu || '';
}

function parseVariantLabel(optionsJson) {
  if (!optionsJson) return '';
  try {
    const obj = typeof optionsJson === 'string' ? JSON.parse(optionsJson) : optionsJson;
    return Object.values(obj).join(' · ');
  } catch {
    return String(optionsJson);
  }
}

function variantState(v, threshold) {
  const th = v.threshold != null ? v.threshold : (threshold ?? DEFAULT_THRESHOLD);
  if ((v.qty || 0) <= 0) return 'out';
  if ((v.qty || 0) <= th) return 'low';
  return 'ok';
}

function variantImage(product, variant) {
  const images = product.images || [];
  return (
    images.find((img) => img.variantId === variant.id) ||
    images.find((img) => !img.variantId) ||
    images[0]
  )?.url || null;
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('ru-RU').replace(/[, ]/g, ' ');
}

function reasonLabel(r) {
  const map = {
    SALE: t('inv_r_sale'),
    RESTOCK: t('inv_r_restock'),
    CORRECTION: t('inv_r_correction'),
    LOSS: t('inv_r_loss2'),
    RETURN: t('inv_r_return'),
  };
  return map[r] || map[r?.toUpperCase()] || r;
}

/* ───────────────────────── StatusPill ───────────────────────── */

function StatusPill({ state }) {
  const labels = {
    ok: t('inv_in_stock'),
    low: t('inv_low_stock'),
    out: t('inv_sold_out'),
  };
  return (
    <span className={`st-pill ${state}`}>
      <i />
      {labels[state]}
    </span>
  );
}

/* ───────────────────────── PhotoThumb ───────────────────────── */

function PhotoThumb({ product, variant, size = 40 }) {
  const url = variantImage(product, variant);
  return (
    <div className="stk-photo" style={{ width: size, height: size, background: product.tone || '#e8e8e4' }}>
      {url ? (
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: Math.round(size * 0.35),
          }}
        >
          {getProductName(product).charAt(0)}
        </span>
      )}
    </div>
  );
}

/* ───────────────────────── Row Menu ───────────────────────── */

function RowMenu({ row, onAdjust, onRestock, onClose }) {
  return (
    <>
      <div className="row-menu-scrim" onClick={onClose} />
      <div className="row-menu">
        <button onClick={() => { onClose(); onAdjust(row); }}>
          {I.edit({ width: 15, height: 15 })} {t('adj_title')}
        </button>
        <button onClick={() => { onClose(); onRestock(row); }}>
          {I.plus({ width: 15, height: 15 })} {t('inv_restock')}
        </button>
      </div>
    </>
  );
}

/* ───────────────────────── AdjustModal ───────────────────────── */

function AdjustModal({ product, variant: initialVariant, onClose, onAdjust }) {
  const allVariants = product.variants || [];
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant.id);
  const variant = allVariants.find((v) => v.id === selectedVariantId) || initialVariant;

  const [kind, setKind] = useState('correction');
  const [count, setCount] = useState(Math.max(0, variant.qty || 0));
  const [n, setN] = useState(1);
  const [note, setNote] = useState('');

  // Reset quantity input when variant or kind changes
  useEffect(() => {
    setCount(Math.max(0, variant.qty || 0));
    setN(1);
  }, [selectedVariantId, kind]);

  const target =
    kind === 'correction'
      ? count
      : kind === 'loss'
        ? Math.max(0, (variant.qty || 0) - n)
        : (variant.qty || 0) + n;
  const delta = target - (variant.qty || 0);

  const kinds = [
    { id: 'correction', label: t('adj_recount'), desc: t('adj_recount_d'), icon: I.undo },
    { id: 'loss', label: t('adj_loss'), desc: t('adj_loss_d'), icon: I.warn },
    { id: 'return', label: t('adj_return'), desc: t('adj_return_d'), icon: I.box },
  ];

  const reasonMap = { correction: 'CORRECTION', loss: 'LOSS', return: 'RETURN' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('adj_title')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {/* Product info */}
          <div className="rsm-prod">
            <div className="rsm-photo" style={{ background: product.tone || '#e8e8e4' }}>
              {variantImage(product, variant) ? (
                <img
                  src={variantImage(product, variant)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  {getProductName(product).charAt(0)}
                </span>
              )}
            </div>
            <div>
              <b style={{ fontSize: 14 }}>{getProductName(product)}</b>
              {product.price != null && (
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--soft)' }}>
                  {fmtPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* What happened? */}
          <div className="rsm-label">{t('adj_title')}</div>
          <div className="adj-kinds">
            {kinds.map((k) => (
              <button
                key={k.id}
                className={`adj-kind${kind === k.id ? ' on' : ''}`}
                onClick={() => {
                  setKind(k.id);
                  setN(1);
                }}
              >
                <span className="adj-ic">{k.icon({ width: 18, height: 18 })}</span>
                <div>
                  <b>{k.label}</b>
                  <span>{k.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Variant selector (multi-variant only) */}
          {allVariants.length > 1 && (
            <div className="chip-row adj-sizes" style={{ marginBottom: 14 }}>
              {allVariants.map((v) => (
                <button
                  key={v.id}
                  className={`pick-chip${v.id === selectedVariantId ? ' on' : ''}`}
                  onClick={() => setSelectedVariantId(v.id)}
                >
                  {parseVariantLabel(v.optionsJson) || `#${v.id}`}
                </button>
              ))}
            </div>
          )}

          {/* Quantity input */}
          <div className="rsm-label">
            {kind === 'correction' ? t('adj_count') : kind === 'loss' ? t('adj_lost') : t('adj_back')}
          </div>
          <div className="adj-qty">
            {kind === 'correction' ? (
              <input
                type="number"
                min="0"
                value={count}
                onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: 80,
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  padding: '8px 12px',
                  border: '1.5px solid var(--line)',
                  borderRadius: 10,
                }}
              />
            ) : (
              <input
                type="number"
                min="1"
                value={n}
                onChange={(e) => setN(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: 80,
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  padding: '8px 12px',
                  border: '1.5px solid var(--line)',
                  borderRadius: 10,
                }}
              />
            )}
            <span className="adj-now">
              {t('inv_qty')}: <b>{variant.qty || 0}</b>
            </span>
          </div>

          {/* Note */}
          <input
            className="qp-note adj-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('inv_note')}
          />

          {/* Footer */}
          <div className="rsm-foot">
            <div className="rsm-sum">
              <span>
                {variant.qty || 0} &rarr; <b>{target}</b> {t('inv_units')}
              </span>
              {delta !== 0 && (
                <i className={delta > 0 ? 'up' : 'down'}>
                  {delta > 0 ? '+' + delta : delta}
                </i>
              )}
            </div>
            <button
              className="btn btn-accent btn-sm"
              disabled={!delta}
              onClick={() => {
                onAdjust(variant.id, product.id, delta, reasonMap[kind], note);
                onClose();
              }}
            >
              {t('adj_btn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── RestockModal ───────────────────────── */

function RestockModal({ product, variant, onClose, onRestock }) {
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const n = parseInt(qty, 10);
    if (!n || n <= 0) return;
    setSaving(true);
    try {
      await onRestock(variant.id, product.id, n, null, note);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('inv_restock')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div className="rsm-prod">
            <div className="rsm-photo" style={{ background: product.tone || '#e8e8e4' }}>
              {variantImage(product, variant) ? (
                <img
                  src={variantImage(product, variant)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  {getProductName(product).charAt(0)}
                </span>
              )}
            </div>
            <div>
              <b style={{ fontSize: 14 }}>{getProductName(product)}</b>
              {parseVariantLabel(variant.optionsJson) && (
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--soft)' }}>
                  {parseVariantLabel(variant.optionsJson)}
                </span>
              )}
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--faint)' }}>
                {t('inv_qty')}: {variant.qty || 0}
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>{t('inv_add_stock')}</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>{t('inv_note')}</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                {t('g_cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-accent btn-sm"
                disabled={!qty || parseInt(qty, 10) <= 0 || saving}
              >
                {I.box({ width: 15, height: 15 })} {t('inv_restock')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── HistoryView ───────────────────────── */

function HistoryView() {
  const shop = useShopStore((s) => s.shop);
  const movements = useShopStore((s) => s.movements);
  const products = useShopStore((s) => s.products);
  const fetchMovements = useShopStore((s) => s.fetchMovements);

  const [reason, setReason] = useState('all');
  const [histSearch, setHistSearch] = useState('');
  const [period, setPeriod] = useState('30');
  const [limit, setLimit] = useState(40);

  useEffect(() => {
    if (shop?.id) fetchMovements();
  }, [shop?.id]);

  // product+variant lookup
  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        map[v.id] = { p, v };
      });
    });
    return map;
  }, [products]);

  // parse and sort movements
  const items = useMemo(() => {
    return (movements || [])
      .map((m) => {
        const ref = productMap[m.variantId];
        const prodName = ref ? getProductName(ref.p) : '';
        const varLabel = ref ? parseVariantLabel(ref.v.optionsJson) : '';
        return {
          ...m,
          at: m.createdAt ? new Date(m.createdAt).getTime() : 0,
          prodName,
          varLabel,
          name: prodName + (varLabel ? ' · ' + varLabel : '') || '—',
        };
      })
      .sort((a, b) => b.at - a.at);
  }, [movements, productMap]);

  // apply period filter
  const periodMs = period === '7' ? 7 * 86400000 : period === '30' ? 30 * 86400000 : 0;
  const periodFiltered = periodMs
    ? items.filter((m) => m.at >= Date.now() - periodMs)
    : items;

  // apply reason filter
  const reasonFiltered =
    reason === 'all'
      ? periodFiltered
      : periodFiltered.filter((m) => (m.reason || '').toUpperCase() === reason.toUpperCase());

  // apply search filter
  const filtered = histSearch.trim()
    ? reasonFiltered.filter((m) => m.name.toLowerCase().includes(histSearch.trim().toLowerCase()))
    : reasonFiltered;

  // counts for reason chips (based on period-filtered, not search-filtered)
  const cnt = (k) =>
    k === 'all'
      ? periodFiltered.length
      : periodFiltered.filter((m) => (m.reason || '').toUpperCase() === k.toUpperCase()).length;

  // summary
  const inN = filtered.filter((m) => m.delta > 0).reduce((s, m) => s + m.delta, 0);
  const outN = filtered.filter((m) => m.delta < 0).reduce((s, m) => s - m.delta, 0);

  // grouping by day
  const dayKey = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };
  const now = Date.now();
  const today = dayKey(now);
  const yday = dayKey(now - 86400000);
  const dayLabel = (ts) => {
    const k = dayKey(ts);
    if (k === today) return t('h_today');
    if (k === yday) return t('h_yday');
    return new Date(ts).toLocaleDateString(
      getLang() === 'ru' ? 'ru-RU' : getLang() === 'uz' ? 'uz-UZ' : 'en-GB',
      { day: '2-digit', month: 'short' }
    );
  };

  const groups = [];
  filtered.slice(0, limit).forEach((m) => {
    const k = dayKey(m.at);
    let g = groups[groups.length - 1];
    if (!g || g.k !== k) {
      g = { k, label: dayLabel(m.at), items: [], net: 0 };
      groups.push(g);
    }
    g.items.push(m);
    g.net += m.delta;
  });

  const reasons = [
    ['all', t('h_all')],
    ['SALE', t('inv_r_sale')],
    ['RESTOCK', t('inv_r_restock')],
    ['CORRECTION', t('inv_r_correction')],
    ['LOSS', t('inv_r_loss2')],
    ['RETURN', t('inv_r_return')],
  ];

  // CSV export
  function exportCSV() {
    const header = 'Date,Time,Product,Variant,Delta,Reason,Note\n';
    const rows = filtered.map((m) => {
      const d = new Date(m.at);
      const date = d.toLocaleDateString('en-CA');
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const prod = (m.prodName || '').replace(/"/g, '""');
      const vl = (m.varLabel || '').replace(/"/g, '""');
      const note = (m.note || '').replace(/"/g, '""');
      return `${date},${time},"${prod}","${vl}",${m.delta > 0 ? '+' : ''}${m.delta},${m.reason || ''},"${note}"`;
    });
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="hist">
      {/* Filter bar */}
      <div className="inv-bar">
        <div className="inline-search grow">
          {I.search({ width: 16, height: 16 })}
          <input
            value={histSearch}
            onChange={(e) => setHistSearch(e.target.value)}
            placeholder={t('sf_search') || 'Search'}
          />
        </div>
        <select
          className="mini-select"
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setLimit(40);
          }}
        >
          <option value="7">7 {getLang() === 'ru' ? 'дней' : 'days'}</option>
          <option value="30">30 {getLang() === 'ru' ? 'дней' : 'days'}</option>
          <option value="all">{t('g_all')}</option>
        </select>
        <button className="btn btn-soft btn-sm" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {/* Reason chips */}
      <div className="chip-row hist-chips">
        {reasons.map(([k, label]) => {
          const n = cnt(k);
          return (
            <button
              key={k}
              className={`pick-chip${reason === k ? ' on' : ''}${!n && reason !== k ? ' zero' : ''}`}
              onClick={() => {
                setReason(k);
                setLimit(40);
              }}
            >
              {label} <i>{n}</i>
            </button>
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="hist-sum">
        <div>
          <span>{t('h_in')}</span>
          <b className="up">+{inN}</b>
        </div>
        <div>
          <span>{t('h_out')}</span>
          <b className="down">&minus;{outN}</b>
        </div>
        <div>
          <span>{t('inv_tab_hist')}</span>
          <b>
            {filtered.length}{' '}
            <i style={{ fontStyle: 'normal', fontSize: 13, color: 'var(--soft)' }}>{t('h_moves')}</i>
          </b>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          className="stk-empty card"
          style={{
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: 32,
            textAlign: 'center',
            color: 'var(--soft)',
          }}
        >
          {t('h_empty')}
        </div>
      )}

      {/* Day groups */}
      <div className="hist-days">
        {groups.map((g) => (
          <div key={g.k} className="hist-day card">
            <div className="hist-day-h">
              <b>{g.label}</b>
              <span className={g.net > 0 ? 'up' : g.net < 0 ? 'down' : ''}>
                {g.net > 0 ? '+' + g.net : g.net}
              </span>
            </div>
            {g.items.map((m) => (
              <div key={m.id} className="mv-row">
                <span className={`mv-delta ${m.delta > 0 ? 'up' : 'down'}`}>
                  {m.delta > 0 ? '+' + m.delta : m.delta}
                </span>
                <div className="mv-main">
                  <b>{m.name}</b>
                  <span>
                    {reasonLabel(m.reason)}
                    {m.unitCost ? ' @ ' + fmtNum(m.unitCost) : ''}
                    {m.note ? ' · ' + m.note : ''}
                  </span>
                </div>
                <span className="mv-at">
                  {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Show more */}
      {filtered.length > limit && (
        <button className="btn btn-soft hist-more" onClick={() => setLimit(limit + 40)}>
          {t('h_more')} · {filtered.length - limit}
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── InventoryView (main) ───────────────────────── */

export default function InventoryView() {
  const [, setTick] = useState(0);
  const [view, setView] = useState('stock');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(null);

  const shop = useShopStore((s) => s.shop);
  const products = useShopStore((s) => s.products);
  const fetchProducts = useShopStore((s) => s.fetchProducts);
  const restockVariant = useShopStore((s) => s.restockVariant);
  const adjustStock = useShopStore((s) => s.adjustStock);

  // re-render on language change
  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);

  // fetch products on mount
  useEffect(() => {
    if (shop?.id) fetchProducts();
  }, [shop?.id, fetchProducts]);

  // flatten all variants into rows
  const rows = useMemo(() => {
    const out = [];
    products.forEach((p) =>
      (p.variants || []).forEach((v) => out.push({ p, v, state: variantState(v) }))
    );
    return out;
  }, [products]);

  // filter counts
  const counts = useMemo(
    () => ({
      all: rows.length,
      low: rows.filter((r) => r.state === 'low').length,
      out: rows.filter((r) => r.state === 'out').length,
    }),
    [rows]
  );

  // visible rows (filter + search)
  const shown = useMemo(() => {
    return rows.filter((r) => {
      if (filter === 'low' && r.state !== 'low') return false;
      if (filter === 'out' && r.state !== 'out') return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = (
          getProductName(r.p) +
          ' ' +
          parseVariantLabel(r.v.optionsJson) +
          ' ' +
          (r.v.barcode || '')
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  // handlers
  async function handleRestock(vId, pId, qty, cost, note) {
    await restockVariant(vId, pId, qty, cost, note);
    toast(t('inv_done'));
  }

  async function handleAdjust(vId, pId, delta, reason, note) {
    await adjustStock(vId, pId, delta, reason, note);
    toast(t('inv_done'));
  }

  // empty state
  if (!products.length) {
    return (
      <div>
        <div className="db-sec-head">
          <div>
            <h2>{t('db_inventory')}</h2>
          </div>
        </div>
        <div className="stock-table">
          <div className="stk-empty">
            {I.box({ width: 28, height: 28 })} {t('inv_no_match')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inv">
      {/* ── Header ── */}
      <div className="db-sec-head">
        <div>
          <h2>{t('db_inventory')}</h2>
          <div className="sub">Quantities, barcodes and stock history</div>
        </div>
        <div className="head-acts">
          <button
            className="btn btn-soft btn-sm"
            onClick={() => {
              const target = rows.find((r) => r.state === 'out' || r.state === 'low') || rows[0];
              if (target) setModal({ k: 'restock', p: target.p, v: target.v });
            }}
          >
            {I.box({ width: 16, height: 16 })} {t('inv_restock')}
          </button>
          <button
            className="btn btn-soft btn-sm"
            onClick={() => {
              const target = rows[0];
              if (target) setModal({ k: 'adjust', p: target.p, v: target.v });
            }}
          >
            {I.edit({ width: 16, height: 16 })} {t('adj_title')}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="inv-tabs">
        <button className={view === 'stock' ? 'on' : ''} onClick={() => setView('stock')}>
          {I.box({ width: 16, height: 16 })} {t('inv_tab_stock')}
        </button>
        <button className={view === 'history' ? 'on' : ''} onClick={() => setView('history')}>
          {I.clock({ width: 16, height: 16 })} {t('inv_tab_hist')}
        </button>
      </div>

      {/* ── History Tab ── */}
      {view === 'history' && <HistoryView />}

      {/* ── Stock Tab ── */}
      {view === 'stock' && (
        <>
          {/* Filter bar */}
          <div className="inv-bar">
            <div className="inline-search grow">
              {I.search({ width: 16, height: 16 })}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('sf_search') || 'Search'}
              />
            </div>
            <div className="chip-row">
              <button
                className={`pick-chip${filter === 'all' ? ' on' : ''}`}
                onClick={() => setFilter('all')}
              >
                {t('g_all')} <i>{counts.all}</i>
              </button>
              <button
                className={`pick-chip${filter === 'low' ? ' on' : ''}`}
                onClick={() => setFilter('low')}
              >
                {t('inv_low_stock')} <i>{counts.low}</i>
              </button>
              <button
                className={`pick-chip${filter === 'out' ? ' on' : ''}`}
                onClick={() => setFilter('out')}
              >
                {t('inv_sold_out')} <i>{counts.out}</i>
              </button>
            </div>
          </div>

          {/* Stock table */}
          <div className="stock-table">
            <div className="stk-head">
              <span className="stk-c-sel" />
              <span className="stk-c-prod">{t('db_products')}</span>
              <span className="stk-c-bc">{t('inv_qty')}</span>
              <span className="stk-c-qty">{t('inv_qty')}</span>
              <span className="stk-c-cost">AVG COST</span>
              <span className="stk-c-st">STATUS</span>
              <span className="stk-c-last" />
              <span className="stk-c-more" />
            </div>

            {shown.length === 0 ? (
              <div className="stk-empty">{t('inv_no_match')}</div>
            ) : (
              shown.map((r) => {
                const name = getProductName(r.p);
                const vLabel = parseVariantLabel(r.v.optionsJson);
                const imgUrl = variantImage(r.p, r.v);

                return (
                  <div key={r.v.id} className="stk-row">
                    {/* col 1: checkbox placeholder */}
                    <span className="stk-c-sel" />

                    {/* col 2: product */}
                    <div className="stk-c-prod">
                      <div
                        className="stk-photo"
                        style={{ background: r.p.tone || '#e8e8e4' }}
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="stk-name">
                        <b>{name}</b>
                        {vLabel && <span>{vLabel}</span>}
                      </div>
                    </div>

                    {/* col 3: barcode */}
                    <span className="stk-c-bc">
                      {r.v.barcode ? (
                        <span className="bc-btn">
                          {I.barcode({ width: 14, height: 14 })} {r.v.barcode}
                        </span>
                      ) : (
                        <span className="bc-btn empty">
                          {I.barcode({ width: 14, height: 14 })} &mdash;
                        </span>
                      )}
                    </span>

                    {/* col 4: qty button */}
                    <span className="stk-c-qty">
                      <button
                        className={`qty-btn${(r.v.qty || 0) <= 0 ? ' zero' : ''}`}
                        title={t('adj_title')}
                        onClick={() => setModal({ k: 'adjust', p: r.p, v: r.v })}
                      >
                        {r.v.qty || 0}
                      </button>
                    </span>

                    {/* col 5: avg cost */}
                    <span className={`stk-c-cost${r.v.avgCost == null ? ' none' : ''}`}>
                      {r.v.avgCost != null ? fmtNum(r.v.avgCost) : '—'}
                    </span>

                    {/* col 6: status */}
                    <span className="stk-c-st">
                      <StatusPill state={r.state} />
                    </span>

                    {/* col 7: last movement (placeholder) */}
                    <span className="stk-c-last" />

                    {/* col 8: actions */}
                    <span className="stk-c-more" style={{ position: 'relative' }}>
                      <button
                        className="icon-btn sm"
                        title={t('inv_restock')}
                        onClick={() => setModal({ k: 'restock', p: r.p, v: r.v })}
                      >
                        {I.plus({ width: 16, height: 16 })}
                      </button>
                      <button
                        className="icon-btn sm"
                        onClick={() => setMenu(menu === r.v.id ? null : r.v.id)}
                      >
                        {I.more({ width: 17, height: 17 })}
                      </button>
                      {menu === r.v.id && (
                        <RowMenu
                          row={r}
                          onAdjust={(row) => setModal({ k: 'adjust', p: row.p, v: row.v })}
                          onRestock={(row) => setModal({ k: 'restock', p: row.p, v: row.v })}
                          onClose={() => setMenu(null)}
                        />
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {modal?.k === 'restock' && (
        <RestockModal
          product={modal.p}
          variant={modal.v}
          onClose={() => setModal(null)}
          onRestock={handleRestock}
        />
      )}
      {modal?.k === 'adjust' && (
        <AdjustModal
          product={modal.p}
          variant={modal.v}
          onClose={() => setModal(null)}
          onAdjust={handleAdjust}
        />
      )}
    </div>
  );
}
