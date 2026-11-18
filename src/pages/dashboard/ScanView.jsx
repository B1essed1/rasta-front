import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange, fmtPrice, fill, getLang } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { I } from '../../components/ui/Icons';
import { toast } from '../../components/ui/ToastHost';
import QtyStepper from '../../components/ui/QtyStepper';

function getProductName(p) {
  if (!p) return '';
  const lang = getLang();
  if (lang === 'uz') return p.nameUz || p.nameEn || p.nameRu || p.name || '';
  if (lang === 'ru') return p.nameRu || p.nameEn || p.nameUz || p.name || '';
  return p.nameEn || p.nameUz || p.nameRu || p.name || '';
}

function parseVariantLabel(optionsJson) {
  if (!optionsJson) return '';
  try {
    const obj = typeof optionsJson === 'string' ? JSON.parse(optionsJson) : optionsJson;
    return Object.values(obj)
      .map((v) => String(v).charAt(0).toUpperCase() + String(v).slice(1))
      .join(' · ');
  } catch {
    return String(optionsJson);
  }
}

const PAY_METHODS = [
  { id: 'cash', labelKey: 'sc_pay_cash' },
  { id: 'card', labelKey: 'sc_pay_card' },
  { id: 'transfer', labelKey: 'sc_pay_transfer' },
];

export default function ScanView() {
  const navigate = useNavigate();
  const shop = useShopStore((s) => s.shop);
  const products = useShopStore((s) => s.products);
  const sales = useShopStore((s) => s.sales);
  const lookupBarcode = useShopStore((s) => s.lookupBarcode);
  const createPosSale = useShopStore((s) => s.createPosSale);
  const fetchSales = useShopStore((s) => s.fetchSales);
  const fetchProducts = useShopStore((s) => s.fetchProducts);

  const [, setTick] = useState(0);
  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);

  const [manual, setManual] = useState(false);
  const [cart, setCart] = useState([]);
  const [pay, setPay] = useState('cash');
  const [q, setQ] = useState('');
  const [warn, setWarn] = useState(null);
  const [flash, setFlash] = useState(null);
  const [err, setErr] = useState(null);
  const [camState, setCamState] = useState('idle');
  const [completing, setCompleting] = useState(false);
  const videoRef = useRef(null);
  const buf = useRef('');

  const todaySales = useMemo(() => {
    const now = new Date().toDateString();
    return (sales || []).filter((s) => new Date(s.createdAt).toDateString() === now);
  }, [sales]);
  const todayRev = todaySales.reduce((n, s) => n + (s.total || 0), 0);

  // Camera barcode scanning
  useEffect(() => {
    let stream, timer, det, stop = false;
    if (manual) return;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCamState('live');
        if ('BarcodeDetector' in window) {
          det = new window.BarcodeDetector({ formats: ['code_128', 'ean_13', 'upc_a', 'qr_code'] });
          const tick = async () => {
            if (stop) return;
            try {
              const codes = await det.detect(videoRef.current);
              if (codes && codes[0]) handleCode(codes[0].rawValue);
            } catch (e) { /* ignore */ }
            timer = setTimeout(tick, 400);
          };
          tick();
        }
      } catch (e) {
        setCamState('denied');
      }
    })();
    return () => {
      stop = true;
      clearTimeout(timer);
      if (stream) stream.getTracks().forEach((x) => x.stop());
    };
  }, [manual]);

  // Keyboard wedge scanner
  useEffect(() => {
    function onKey(e) {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'Enter') {
        if (buf.current.length > 3) handleCode(buf.current);
        buf.current = '';
        return;
      }
      if (e.key.length === 1) buf.current += e.key;
      if (buf.current.length > 40) buf.current = '';
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [products]);

  const addRow = useCallback((p, v, force) => {
    if ((v.qty || 0) <= 0 && !force) {
      setWarn({ p, v });
      return;
    }
    setCart((c) => {
      const i = c.findIndex((l) => l.variantId === v.id);
      if (i >= 0) {
        const out = [...c];
        out[i] = { ...out[i], qty: out[i].qty + 1 };
        return out;
      }
      return [
        ...c,
        {
          variantId: v.id,
          productId: p.id,
          name: getProductName(p),
          label: parseVariantLabel(v.optionsJson),
          qty: 1,
          unit: p.price,
          cost: v.avgCost || 0,
          over: (v.qty || 0) <= 0,
        },
      ];
    });
    setErr(null);
    setWarn(null);
    const name = getProductName(p);
    const label = parseVariantLabel(v.optionsJson);
    setFlash(name + (label ? ' · ' + label : ''));
    setTimeout(() => setFlash(null), 1500);
  }, []);

  async function handleCode(code) {
    const product = await lookupBarcode(code);
    if (!product) {
      setErr(String(code));
      return;
    }
    const variant = (product.variants || []).find(
      (v) => v.barcode === code
    ) || product.variants?.[0];
    if (variant) addRow(product, variant);
  }

  const total = cart.reduce((n, l) => n + l.qty * l.unit, 0);
  const items = cart.reduce((n, l) => n + l.qty, 0);

  const searchRows = useMemo(() => {
    const rows = [];
    (products || []).forEach((p) =>
      (p.variants || []).forEach((v) => {
        const hay = (getProductName(p) + ' ' + parseVariantLabel(v.optionsJson) + ' ' + (v.barcode || '')).toLowerCase();
        if (!q || hay.includes(q.toLowerCase())) rows.push({ p, v });
      })
    );
    return rows;
  }, [products, q]);

  async function completeSale() {
    if (!cart.length || completing) return;
    setCompleting(true);
    try {
      const saleItems = cart.map(({ variantId, productId, name, label, qty, unit, cost }) => ({
        variantId,
        productId,
        name,
        label,
        qty,
        unitPrice: unit,
        cost,
      }));
      await createPosSale(saleItems, pay);
      toast(t('sc_recorded') + ' · ' + fmtPrice(total));
      setCart([]);
    } catch (e) {
      toast(e?.serverMessage || 'Error');
    } finally {
      setCompleting(false);
    }
  }

  const firstImage = (product) => {
    const img = (product.images || [])[0];
    return img?.thumbnailUrl || img?.url || null;
  };

  return (
    <div className="pos-scrim">
      <div className="pos">
        {/* Header */}
        <div className="pos-top">
          <button className="icon-btn" onClick={() => navigate('/dashboard')} aria-label={t('close')}>
            {I.x({ width: 18, height: 18 })}
          </button>
          <div className="pos-title">
            {I.scan({ width: 17, height: 17 })} {t('db_scan')}
          </div>
        </div>

        {/* Scanner / Search area */}
        <div className="pos-scan">
          {!manual ? (
            <div className="pos-cam">
              <video ref={videoRef} playsInline muted />
              <div className="pos-reticle">
                <span className="pos-scanline" />
              </div>
              <div className="pos-cam-hint">
                {camState === 'denied' ? t('sc_cam_off') : t('sc_point')}
              </div>
            </div>
          ) : (
            <div className="pos-manual">
              <div className="pos-search-row">
                {I.search({ width: 17, height: 17 })}
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('inv_search') || 'Search...'}
                  autoFocus
                />
              </div>
              <div className="pos-list">
                {searchRows.slice(0, 30).map(({ p, v }) => (
                  <button key={v.id} className="pos-item" onClick={() => addRow(p, v)}>
                    <div className="pos-item-ph">
                      {firstImage(p) ? (
                        <img src={firstImage(p)} alt="" />
                      ) : (
                        <div className="pos-item-placeholder">{I.grid({ width: 16, height: 16 })}</div>
                      )}
                    </div>
                    <div className="pos-item-m">
                      <b>{getProductName(p)}</b>
                      <span>
                        {parseVariantLabel(v.optionsJson)
                          ? parseVariantLabel(v.optionsJson) + ' · '
                          : ''}
                        {t('inv_qty')} {v.qty}
                      </span>
                    </div>
                    <span className="pos-item-p">{fmtPrice(p.price)}</span>
                  </button>
                ))}
                {searchRows.length === 0 && (
                  <div className="pos-cart-empty" style={{ height: 120 }}>
                    {t('inv_no_match')}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pos-mode-btns">
            {!manual ? (
              <button className="btn btn-soft btn-xs" onClick={() => setManual(true)}>
                {I.search({ width: 14, height: 14 })} {t('sc_enter')}
              </button>
            ) : (
              <button className="btn btn-soft btn-xs" onClick={() => setManual(false)}>
                {I.camera({ width: 15, height: 15 })} {t('sc_camera')}
              </button>
            )}
            {!manual && (
              <button
                className="btn btn-soft btn-xs"
                onClick={() => {
                  const all = [];
                  (products || []).forEach((p) =>
                    (p.variants || []).forEach((v) => {
                      if (v.barcode) all.push(v.barcode);
                    })
                  );
                  if (all.length) handleCode(all[Math.floor(Math.random() * all.length)]);
                }}
              >
                {I.spark({ width: 14, height: 14 })} {t('sc_demo_scan')}
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="pos-alerts">
          {flash && (
            <div className="pos-flash">
              {I.check({ width: 16, height: 16 })} <b>{flash}</b> {t('sc_added')}
            </div>
          )}
          {warn && (
            <div className="pos-warncard">
              <div className="pw-t">
                {I.warn({ width: 16, height: 16 })}{' '}
                {fill(t('sc_soldout_line'), {
                  name:
                    getProductName(warn.p) +
                    (parseVariantLabel(warn.v.optionsJson)
                      ? ' · ' + parseVariantLabel(warn.v.optionsJson)
                      : ''),
                })}
              </div>
              <div className="pw-acts">
                <button className="btn btn-soft btn-xs" onClick={() => setWarn(null)}>
                  {t('cancel')}
                </button>
                <button className="btn btn-warn btn-xs" onClick={() => addRow(warn.p, warn.v, true)}>
                  {t('sc_sell_anyway')}
                </button>
              </div>
            </div>
          )}
          {err && (
            <div className="pos-err">
              <b>{t('sc_notfound')}</b>
              <code>{err}</code>
              <div className="pos-err-acts">
                <button
                  className="btn btn-accent btn-xs"
                  onClick={() => {
                    setErr(null);
                    navigate('/dashboard/products');
                  }}
                >
                  {I.plus({ width: 14, height: 14 })} {t('sc_addnew')}
                </button>
                <button className="btn btn-soft btn-xs" onClick={() => setErr(null)}>
                  {t('close')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="pos-cart-list">
          {cart.length === 0 && (
            <div className="pos-cart-empty">
              {I.scan({ width: 24, height: 24 })}
              <span>{t('sc_cart_empty')}</span>
            </div>
          )}
          {cart.map((l, i) => (
            <div key={l.variantId} className="pos-line">
              <div className="pl-main">
                <b>
                  {l.name}
                  {l.over && <span className="pl-over">!</span>}
                </b>
                <span>
                  {l.label ? l.label + ' · ' : ''}
                  <input
                    className="pl-price"
                    value={l.unit}
                    inputMode="numeric"
                    title={t('sc_discount')}
                    onChange={(e) => {
                      const v = Number(e.target.value.replace(/\D/g, '')) || 0;
                      setCart((c) => c.map((x, k) => (k === i ? { ...x, unit: v } : x)));
                    }}
                  />
                  <span className="pl-cur">{getLang() === 'ru' ? 'сум' : "so'm"}</span>
                </span>
              </div>
              <QtyStepper
                value={l.qty}
                min={1}
                onChange={(n) => setCart((c) => c.map((x, k) => (k === i ? { ...x, qty: n } : x)))}
              />
              <span className="pl-sum">{fmtPrice(l.qty * l.unit)}</span>
              <button
                className="icon-btn sm"
                onClick={() => setCart((c) => c.filter((_, k) => k !== i))}
                aria-label={t('confirm_delete')}
              >
                {I.x({ width: 14, height: 14 })}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pos-foot">
          <div className="pos-paychips">
            {PAY_METHODS.map((m) => (
              <button
                key={m.id}
                className={'pick-chip' + (pay === m.id ? ' on' : '')}
                onClick={() => setPay(m.id)}
              >
                {t(m.labelKey)}
              </button>
            ))}
          </div>
          <div className="pos-total">
            <span>
              {items} {t('sc_items')}
            </span>
            <b>{fmtPrice(total)}</b>
          </div>
          <button
            className="btn btn-accent"
            disabled={!cart.length || completing}
            onClick={completeSale}
          >
            {I.check({ width: 18, height: 18 })} {t('sc_complete')}
          </button>
          <div className="pos-today">
            {t('sc_today')}: <b>{todaySales.length} {t('sc_items')}</b> ·{' '}
            <b>{fmtPrice(todayRev)}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
