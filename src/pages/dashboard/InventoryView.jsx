import React, { useState, useEffect, useMemo, useRef } from 'react';
import { t, onLangChange, fmtPrice, getLang } from '../../i18n';
import { useShopStore, DEFAULT_THRESHOLD } from '../../store/shopStore';
import { I } from '../../components/ui/Icons';
import { toast } from '../../components/ui/ToastHost';
import QtyStepper from '../../components/ui/QtyStepper';

/* ───────────────────────── helpers ───────────────────────── */

function eanValid(code) {
  if (!code || (!/^\d{13}$/.test(code) && !/^\d{12}$/.test(code))) return null;
  const digits = code.padStart(13, '0').split('').map(Number);
  const sum = digits.slice(0, 12).reduce((s, d, i) => s + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return check === digits[12];
}

function generateBarcode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

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
    return Object.entries(obj)
      .map(([k, v]) => {
        const val = String(v).charAt(0).toUpperCase() + String(v).slice(1);
        return val;
      })
      .join(' · ');
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

/* ───────────────────────── RestockPicker ───────────────────────── */

function RestockPicker({ products, onPick, onClose }) {
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    if (!q.trim()) return products;
    const low = q.trim().toLowerCase();
    return products.filter((p) => {
      const hay = (
        getProductName(p) +
        ' ' +
        (p.variants || []).map((v) => parseVariantLabel(v.optionsJson) + ' ' + (v.barcode || '')).join(' ')
      ).toLowerCase();
      return hay.includes(low);
    });
  }, [products, q]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('inv_pick_product')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '16px 24px' }}>
          <div className="inline-search" style={{ marginBottom: 12 }}>
            {I.search({ width: 16, height: 16 })}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('sf_search') || 'Search'}
              autoFocus
            />
          </div>
          <div className="restock-pick">
            {list.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--soft)' }}>
                {t('inv_no_match')}
              </div>
            )}
            {list.map((p) => {
              const totalQty = (p.variants || []).reduce((s, v) => s + (v.qty || 0), 0);
              const imgUrl = variantImage(p, (p.variants || [])[0] || {});
              return (
                <div
                  key={p.id}
                  className="restock-pick-item"
                  onClick={() => onPick(p)}
                >
                  <div
                    className="stk-photo"
                    style={{ width: 40, height: 40, background: p.tone || '#e8e8e4' }}
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        {getProductName(p).charAt(0)}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 14, fontWeight: 650 }}>{getProductName(p)}</b>
                    <span style={{ fontSize: 12, color: 'var(--soft)' }}>
                      {totalQty} {t('inv_units')}
                      {(p.variants || []).length > 1
                        ? ' · ' + (p.variants || []).length + ' variants'
                        : ''}
                    </span>
                  </div>
                  <span style={{ color: 'var(--faint)' }}>
                    {I.arrow ? I.arrow({ width: 16, height: 16 }) : '>'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── RestockModal (rich multi-variant) ───────────────────────── */

function RestockModal({ product, variant, onClose, onRestock }) {
  const allVariants = product.variants || [];
  const isSingleVariantMode = !!variant;
  const multi = allVariants.length > 1 && !isSingleVariantMode;

  // Qty per variant: { [variantId]: number }
  const [qtys, setQtys] = useState(() => {
    if (isSingleVariantMode) {
      return { [variant.id]: 0 };
    }
    return Object.fromEntries(allVariants.map((v) => [v.id, 0]));
  });

  // Cost fields
  const baseAvg = allVariants.find((v) => v.avgCost != null);
  const [cost, setCost] = useState(baseAvg ? String(baseAvg.avgCost) : '');
  const [perSize, setPerSize] = useState(false);
  const [costs, setCosts] = useState(() =>
    Object.fromEntries(allVariants.map((v) => [v.id, v.avgCost != null ? String(v.avgCost) : '']))
  );

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const variantsToShow = isSingleVariantMode ? [variant] : allVariants;
  const totalAdding = variantsToShow.reduce((s, v) => s + (qtys[v.id] || 0), 0);
  const costNum = (id) => {
    const raw = perSize ? costs[id] : cost;
    return parseFloat(raw) || 0;
  };

  // Compute new weighted average cost for a variant
  function newAvgCost(v) {
    const oldQty = v.qty || 0;
    const oldAvg = v.avgCost || 0;
    const addQty = qtys[v.id] || 0;
    const unitCost = costNum(v.id);
    if (addQty <= 0 || unitCost <= 0) return null;
    if (oldQty + addQty <= 0) return null;
    return Math.round((oldQty * oldAvg + addQty * unitCost) / (oldQty + addQty));
  }

  // Compute totals for summary
  const totalSpend = variantsToShow.reduce((s, v) => {
    const addQty = qtys[v.id] || 0;
    return s + addQty * costNum(v.id);
  }, 0);

  // Weighted average of new avg costs across all variants being restocked
  const weightedNewAvg = (() => {
    let wSum = 0;
    let wQty = 0;
    variantsToShow.forEach((v) => {
      const addQty = qtys[v.id] || 0;
      const avg = newAvgCost(v);
      if (addQty > 0 && avg != null) {
        wSum += avg * addQty;
        wQty += addQty;
      }
    });
    return wQty > 0 ? Math.round(wSum / wQty) : null;
  })();

  async function handleSubmit(e) {
    e.preventDefault();
    if (totalAdding <= 0) return;
    setSaving(true);
    try {
      const toRestock = variantsToShow.filter((v) => (qtys[v.id] || 0) > 0);
      for (const v of toRestock) {
        await onRestock(v.id, product.id, qtys[v.id], costNum(v.id) || null, note);
      }
      toast(t('inv_done'));
      onClose();
    } catch {
      setSaving(false);
    }
  }

  const numOnly = (s) => s.replace(/[^\d]/g, '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('inv_restock_title')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {/* Product info */}
          <div className="rsm-prod">
            <div className="rsm-photo" style={{ background: product.tone || '#e8e8e4' }}>
              {variantImage(product, variantsToShow[0]) ? (
                <img
                  src={variantImage(product, variantsToShow[0])}
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

          <form onSubmit={handleSubmit}>
            {/* Variant rows */}
            <div className="restock-variants">
              {variantsToShow.map((v) => {
                const label = parseVariantLabel(v.optionsJson);
                const avg = newAvgCost(v);
                return (
                  <div key={v.id} className="restock-row">
                    <div className="restock-label">
                      <b>{label || getProductName(product)}</b>
                      <span>
                        {t('inv_current')}: {v.qty || 0} {t('inv_units')}
                        {v.avgCost != null ? ' · ' + fmtNum(v.avgCost) : ''}
                      </span>
                    </div>
                    <QtyStepper
                      value={qtys[v.id] || 0}
                      min={0}
                      onChange={(n) => setQtys((s) => ({ ...s, [v.id]: n }))}
                    />
                    {perSize && (
                      <input
                        className="restock-cost"
                        value={costs[v.id] || ''}
                        inputMode="numeric"
                        placeholder="0"
                        onChange={(e) =>
                          setCosts((s) => ({ ...s, [v.id]: numOnly(e.target.value) }))
                        }
                        style={{
                          width: 100,
                          border: '1.5px solid var(--line)',
                          borderRadius: 10,
                          padding: '8px 10px',
                          fontSize: 14,
                          textAlign: 'right',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Single cost field (when not per-size) */}
            {!perSize && (
              <div className="field" style={{ marginTop: 4, marginBottom: 14 }}>
                <label>{t('inv_cost_per_unit')}</label>
                <input
                  value={cost}
                  inputMode="numeric"
                  placeholder="0"
                  onChange={(e) => setCost(numOnly(e.target.value))}
                />
              </div>
            )}

            {/* Per-size cost toggle (only for multi-variant) */}
            {multi && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--ink-2)',
                  cursor: 'pointer',
                  marginBottom: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={perSize}
                  onChange={(e) => setPerSize(e.target.checked)}
                />
                {t('inv_diff_cost')}
              </label>
            )}

            {/* Summary */}
            {totalAdding > 0 && (
              <div className="restock-summary">
                <div className="restock-summary-row">
                  <span>{t('inv_adding').replace('{n}', totalAdding)}</span>
                  {totalSpend > 0 && <b>{fmtNum(totalSpend)}</b>}
                </div>
                {weightedNewAvg != null && (
                  <div className="restock-summary-row">
                    <span>{t('inv_new_avg')}</span>
                    <b>{fmtNum(weightedNewAvg)}</b>
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            <div className="field" style={{ marginTop: 14, marginBottom: 20 }}>
              <label>{t('inv_note')}</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                {t('g_cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-accent btn-sm"
                disabled={totalAdding <= 0 || saving}
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

/* ───────────────────────── BarcodeModal ───────────────────────── */

function BarcodeModal({ product, variant, onClose, onSave }) {
  const [code, setCode] = useState(variant.barcode || '');
  const [saving, setSaving] = useState(false);

  const trimmed = code.trim();
  const digits = trimmed.replace(/\D/g, '');
  const isEanish = digits.length >= 12 && digits.length <= 13 && digits === trimmed;
  const eanResult = isEanish ? eanValid(digits) : null;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(product, variant, trimmed);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  function handleGenerate() {
    setCode(generateBarcode());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('inv_barcode_edit')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {/* Product info */}
          <div className="rsm-prod" style={{ marginBottom: 16 }}>
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
            </div>
          </div>

          {/* Current barcode display */}
          {variant.barcode && (
            <div style={{ textAlign: 'center', marginBottom: 14, padding: '12px 0', background: 'var(--paper)', borderRadius: 10, border: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 15, letterSpacing: '0.12em' }}>
                {I.barcode({ width: 16, height: 16 })} {variant.barcode}
              </span>
            </div>
          )}

          {/* Input field */}
          <div className="field" style={{ marginBottom: 8 }}>
            <label>{t('inv_barcode_edit')}</label>
            <input
              className="bc-modal-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 20))}
              placeholder="e.g. 4820024700016"
              autoFocus
            />
          </div>

          {/* EAN validation status */}
          {trimmed && (
            <div>
              {eanResult === true && (
                <div className="bc-status ok">
                  {I.check({ width: 14, height: 14 })} {t('inv_ean_valid')} &mdash; {t('inv_factory')}
                </div>
              )}
              {eanResult === false && (
                <div className="bc-status bad">
                  {I.warn({ width: 14, height: 14 })} {t('inv_ean_invalid')}
                </div>
              )}
              {eanResult === null && (
                <div className="bc-status" style={{ color: 'var(--soft)' }}>
                  {t('inv_custom_code')}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-soft btn-sm" onClick={handleGenerate}>
              {I.spark({ width: 15, height: 15 })} {t('inv_barcode_gen')}
            </button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              {t('g_cancel')}
            </button>
            <button
              className="btn btn-accent btn-sm"
              disabled={!trimmed || eanResult === false || saving}
              onClick={handleSave}
            >
              {t('inv_barcode_save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── LabelsModal ───────────────────────── */

function LabelsModal({ rows, onClose }) {
  const [format, setFormat] = useState('a4');
  const [selected, setSelected] = useState(() => rows.map((r) => r.v.id));

  const allChecked = selected.length === rows.length;

  function toggleAll() {
    setSelected(allChecked ? [] : rows.map((r) => r.v.id));
  }

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const chosen = rows.filter((r) => selected.includes(r.v.id));

  function handlePrint() {
    // Build a hidden print container
    let container = document.querySelector('.label-print');
    if (container) container.remove();
    container = document.createElement('div');
    container.className = 'label-print';
    container.style.display = 'none';

    const grid = document.createElement('div');
    grid.className = 'label-grid' + (format === 'thermal' ? ' thermal' : '');

    chosen.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'label-card';
      const name = getProductName(r.p);
      const vLabel = parseVariantLabel(r.v.optionsJson);
      const price = r.p.price != null ? fmtPrice(r.p.price) : '';
      card.innerHTML =
        '<b>' + name + '</b>' +
        (vLabel ? '<span>' + vLabel + '</span>' : '') +
        (price ? '<span>' + price + '</span>' : '') +
        '<code>' + (r.v.barcode || '---') + '</code>';
      grid.appendChild(card);
    });

    container.appendChild(grid);
    document.body.appendChild(container);
    window.print();
    setTimeout(() => container.remove(), 1000);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('inv_labels_title')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {/* Format selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <button
              className={`pick-chip${format === 'a4' ? ' on' : ''}`}
              onClick={() => setFormat('a4')}
            >
              {t('inv_format_a4')}
            </button>
            <button
              className={`pick-chip${format === 'thermal' ? ' on' : ''}`}
              onClick={() => setFormat('thermal')}
            >
              {t('inv_format_thermal')}
            </button>
          </div>

          {/* Select all / deselect all */}
          <label className="label-row" style={{ borderBottom: '2px solid var(--line)', fontWeight: 600 }}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            <span>{t('inv_select_all')} ({rows.length})</span>
          </label>

          {/* Variant list with checkboxes */}
          <div className="label-list">
            {rows.map((r) => {
              const name = getProductName(r.p);
              const vLabel = parseVariantLabel(r.v.optionsJson);
              return (
                <label key={r.v.id} className="label-row">
                  <input
                    type="checkbox"
                    checked={selected.includes(r.v.id)}
                    onChange={() => toggle(r.v.id)}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b>{name}</b>
                    {vLabel ? ' · ' + vLabel : ''}
                  </span>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--soft)' }}>
                    {r.v.barcode || '---'}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Preview */}
          <div className="label-preview">
            <div className={`label-grid${format === 'thermal' ? ' thermal' : ''}`}>
              {chosen.slice(0, 9).map((r) => {
                const name = getProductName(r.p);
                const vLabel = parseVariantLabel(r.v.optionsJson);
                return (
                  <div key={r.v.id} className="label-card">
                    <b>{name}</b>
                    {vLabel && <span style={{ display: 'block', color: 'var(--soft)' }}>{vLabel}</span>}
                    {r.p.price != null && <span style={{ display: 'block' }}>{fmtPrice(r.p.price)}</span>}
                    <code>{r.v.barcode || '---'}</code>
                  </div>
                );
              })}
              {chosen.length > 9 && (
                <div className="label-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soft)' }}>
                  +{chosen.length - 9} more
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              {t('g_cancel')}
            </button>
            <button
              className="btn btn-accent btn-sm"
              disabled={!chosen.length}
              onClick={handlePrint}
            >
              {I.printer({ width: 15, height: 15 })} {t('inv_print')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── ReportsView ───────────────────────── */

function ReportsView() {
  const products = useShopStore((s) => s.products);
  const movements = useShopStore((s) => s.movements);
  const shop = useShopStore((s) => s.shop);
  const fetchSalesSummary = useShopStore((s) => s.fetchSalesSummary);

  const [salesData, setSalesData] = useState(null);

  useEffect(() => {
    if (!shop?.id) return;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);
    fetchSalesSummary(from, to).then((d) => { if (d) setSalesData(d); });
  }, [shop?.id, fetchSalesSummary]);

  // KPI: stock value at cost
  const stockCost = useMemo(() => {
    let total = 0;
    products.forEach((p) =>
      (p.variants || []).forEach((v) => {
        total += (v.qty || 0) * (v.avgCost || 0);
      })
    );
    return total;
  }, [products]);

  // KPI: stock value at retail
  const stockRetail = useMemo(() => {
    let total = 0;
    products.forEach((p) =>
      (p.variants || []).forEach((v) => {
        total += (v.qty || 0) * (p.price || 0);
      })
    );
    return total;
  }, [products]);

  // KPI: losses
  const totalLosses = useMemo(() => {
    return (movements || [])
      .filter((m) => (m.reason || '').toUpperCase() === 'LOSS')
      .reduce((sum, m) => sum + Math.abs(m.delta || 0) * (m.unitCost || 0), 0);
  }, [movements]);

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

  // Best sellers: top products by SALE qty
  const bestSellers = useMemo(() => {
    const map = {};
    (movements || [])
      .filter((m) => (m.reason || '').toUpperCase() === 'SALE')
      .forEach((m) => {
        const ref = productMap[m.variantId];
        const name = ref ? getProductName(ref.p) : '—';
        const pid = ref ? ref.p.id : m.variantId;
        if (!map[pid]) map[pid] = { name, qty: 0 };
        map[pid].qty += Math.abs(m.delta || 0);
      });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [movements, productMap]);

  // Running out soon: variants where state is LOW
  const runningOut = useMemo(() => {
    const out = [];
    products.forEach((p) =>
      (p.variants || []).forEach((v) => {
        const st = variantState(v);
        if (st === 'low') {
          out.push({
            name: getProductName(p) + (parseVariantLabel(v.optionsJson) ? ' · ' + parseVariantLabel(v.optionsJson) : ''),
            qty: v.qty || 0,
          });
        }
      })
    );
    return out.sort((a, b) => a.qty - b.qty).slice(0, 10);
  }, [products]);

  // Dead stock: products with no SALE movement in last 30 days
  const deadStock = useMemo(() => {
    const cutoff = Date.now() - 30 * 86400000;
    const soldPids = new Set();
    (movements || [])
      .filter((m) => (m.reason || '').toUpperCase() === 'SALE' && m.createdAt && new Date(m.createdAt).getTime() >= cutoff)
      .forEach((m) => {
        const ref = productMap[m.variantId];
        if (ref) soldPids.add(ref.p.id);
      });
    return products
      .filter((p) => !soldPids.has(p.id) && (p.variants || []).some((v) => (v.qty || 0) > 0))
      .map((p) => {
        const totalQty = (p.variants || []).reduce((s, v) => s + (v.qty || 0), 0);
        return { name: getProductName(p), qty: totalQty };
      })
      .slice(0, 10);
  }, [products, movements, productMap]);

  // Losses by product
  const lossByProduct = useMemo(() => {
    const map = {};
    (movements || [])
      .filter((m) => (m.reason || '').toUpperCase() === 'LOSS')
      .forEach((m) => {
        const ref = productMap[m.variantId];
        const name = ref ? getProductName(ref.p) : '—';
        const pid = ref ? ref.p.id : m.variantId;
        if (!map[pid]) map[pid] = { name, qty: 0, cost: 0 };
        map[pid].qty += Math.abs(m.delta || 0);
        map[pid].cost += Math.abs(m.delta || 0) * (m.unitCost || 0);
      });
    return Object.values(map).sort((a, b) => b.cost - a.cost).slice(0, 10);
  }, [movements, productMap]);

  // Restock spending by product
  const restockSpend = useMemo(() => {
    const map = {};
    (movements || [])
      .filter((m) => (m.reason || '').toUpperCase() === 'RESTOCK')
      .forEach((m) => {
        const ref = productMap[m.variantId];
        const name = ref ? getProductName(ref.p) : '—';
        const pid = ref ? ref.p.id : m.variantId;
        if (!map[pid]) map[pid] = { name, qty: 0, cost: 0 };
        map[pid].qty += Math.abs(m.delta || 0);
        map[pid].cost += Math.abs(m.delta || 0) * (m.unitCost || 0);
      });
    return Object.values(map).sort((a, b) => b.cost - a.cost).slice(0, 10);
  }, [movements, productMap]);

  return (
    <div className="hx-reports-view">
      {/* KPI cards */}
      <div className="hx-kpis">
        <div className="hx-kpi">
          <div className="hx-kpi-label">{t('hx_stock_cost')}</div>
          <div className="hx-kpi-val">{fmtNum(stockCost)}</div>
        </div>
        <div className="hx-kpi">
          <div className="hx-kpi-label">{t('hx_stock_retail')}</div>
          <div className="hx-kpi-val">{fmtNum(stockRetail)}</div>
        </div>
        <div className="hx-kpi">
          <div className="hx-kpi-label">{t('hx_revenue')}</div>
          <div className="hx-kpi-val">
            {salesData ? fmtNum(salesData.revenue || 0) : '—'}
            {salesData?.profit != null && (
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--soft)', marginLeft: 8 }}>
                +{fmtNum(salesData.profit)} {t('sa_gross_profit').toLowerCase()}
              </span>
            )}
          </div>
        </div>
        <div className="hx-kpi">
          <div className="hx-kpi-label">{t('hx_losses')}</div>
          <div className="hx-kpi-val" style={{ color: totalLosses > 0 ? '#c4392f' : undefined }}>
            {totalLosses > 0 ? '-' : ''}{fmtNum(totalLosses)}
          </div>
        </div>
      </div>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <div className="hx-panel">
          <h4>{t('hx_best_sellers')}</h4>
          {bestSellers.map((r, i) => (
            <div key={i} className="hx-panel-row">
              <span>{r.name}</span>
              <b>{r.qty} {t('inv_units')}</b>
            </div>
          ))}
        </div>
      )}

      {/* Running out soon */}
      {runningOut.length > 0 && (
        <div className="hx-panel">
          <h4>{t('hx_running_out')}</h4>
          {runningOut.map((r, i) => (
            <div key={i} className="hx-panel-row">
              <span>{r.name}</span>
              <b style={{ color: '#b06f1e' }}>{r.qty} {t('inv_units')}</b>
            </div>
          ))}
        </div>
      )}

      {/* Dead stock */}
      {deadStock.length > 0 && (
        <div className="hx-panel">
          <h4>{t('hx_dead_stock')}</h4>
          {deadStock.map((r, i) => (
            <div key={i} className="hx-panel-row">
              <span>{r.name}</span>
              <b style={{ color: 'var(--faint)' }}>{r.qty} {t('inv_units')}</b>
            </div>
          ))}
        </div>
      )}

      {/* Losses by product */}
      {lossByProduct.length > 0 && (
        <div className="hx-panel">
          <h4>{t('hx_loss_by_product')}</h4>
          {lossByProduct.map((r, i) => (
            <div key={i} className="hx-panel-row">
              <span>{r.name} ({r.qty} {t('inv_units')})</span>
              <b style={{ color: '#c4392f' }}>-{fmtNum(r.cost)}</b>
            </div>
          ))}
        </div>
      )}

      {/* Restock spending */}
      {restockSpend.length > 0 && (
        <div className="hx-panel">
          <h4>{t('hx_restock_spend')}</h4>
          {restockSpend.map((r, i) => (
            <div key={i} className="hx-panel-row">
              <span>{r.name} ({r.qty} {t('inv_units')})</span>
              <b>{fmtNum(r.cost)}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── HistoryView ───────────────────────── */

function HistoryView() {
  const shop = useShopStore((s) => s.shop);
  const movements = useShopStore((s) => s.movements);
  const products = useShopStore((s) => s.products);
  const fetchMovements = useShopStore((s) => s.fetchMovements);

  const [histSub, setHistSub] = useState('timeline');
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
      {/* Timeline | Reports toggle */}
      <div className="hx-seg">
        <button className={histSub === 'timeline' ? 'on' : ''} onClick={() => setHistSub('timeline')}>
          {t('hx_timeline')}
        </button>
        <button className={histSub === 'reports' ? 'on' : ''} onClick={() => setHistSub('reports')}>
          {t('hx_reports')}
        </button>
      </div>

      {/* Reports sub-view */}
      {histSub === 'reports' && <ReportsView />}

      {/* Timeline sub-view */}
      {histSub === 'timeline' && <>
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
      </>}
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
  const updateProduct = useShopStore((s) => s.updateProduct);

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

  const fetchMovements = useShopStore((s) => s.fetchMovements);

  async function handleRestock(vId, pId, qty, cost, note) {
    await restockVariant(vId, pId, qty, cost, note);
  }

  async function handleAdjust(vId, pId, delta, reason, note) {
    await adjustStock(vId, pId, delta, reason, note);
    toast(t('inv_done'));
    fetchProducts();
    fetchMovements();
  }

  async function handleSaveBarcode(product, variant, newBarcode) {
    const updatedVariants = (product.variants || []).map((v) =>
      v.id === variant.id ? { ...v, barcode: newBarcode } : v
    );
    await updateProduct(product.id, { ...product, variants: updatedVariants });
    toast(t('inv_done'));
    fetchProducts();
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
            onClick={() => setModal({ k: 'restock-pick' })}
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
          <button
            className="btn btn-soft btn-sm"
            onClick={() => setModal({ k: 'labels' })}
          >
            {I.printer({ width: 16, height: 16 })} {t('inv_labels')}
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

                    {/* col 3: barcode (clickable to edit) */}
                    <span className="stk-c-bc">
                      {r.v.barcode ? (
                        <button
                          className="bc-btn"
                          style={{ cursor: 'pointer' }}
                          title={t('inv_barcode_edit')}
                          onClick={() => setModal({ k: 'barcode', p: r.p, v: r.v })}
                        >
                          {I.barcode({ width: 14, height: 14 })} {r.v.barcode}
                        </button>
                      ) : (
                        <button
                          className="bc-btn empty"
                          style={{ cursor: 'pointer' }}
                          title={t('inv_barcode_edit')}
                          onClick={() => setModal({ k: 'barcode', p: r.p, v: r.v })}
                        >
                          {I.barcode({ width: 14, height: 14 })} &mdash;
                        </button>
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
      {modal?.k === 'restock-pick' && (
        <RestockPicker
          products={products}
          onPick={(p) => setModal({ k: 'restock', p, v: null })}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.k === 'restock' && (
        <RestockModal
          product={modal.p}
          variant={modal.v || null}
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
      {modal?.k === 'barcode' && (
        <BarcodeModal
          product={modal.p}
          variant={modal.v}
          onClose={() => setModal(null)}
          onSave={handleSaveBarcode}
        />
      )}
      {modal?.k === 'labels' && (
        <LabelsModal
          rows={rows}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
