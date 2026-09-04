import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LangPill from '../components/ui/LangPill';
import EmptyState from '../components/ui/EmptyState';
import { t, onLangChange, fmtPrice, fill } from '../i18n';
import { useShopStore } from '../store/shopStore';
import { getTheme, applyThemeVars } from '../data/themes';
import { getPalette, applyPaletteVars } from '../data/palettes';
import api from '../api/client';
import '../styles/storefront.css';

/* ===== helpers ===== */

const TONE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

function toneColor(product) {
  if (product.tone) return product.tone;
  const hash = (product.id || '').toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TONE_COLORS[hash % TONE_COLORS.length];
}

function getProductName(product) {
  return product.nameEn || product.nameUz || product.nameRu || '';
}

function getProductDesc(product) {
  return product.descEn || product.descUz || product.descRu || '';
}

function parseVariantLabel(optionsJson) {
  if (!optionsJson) return '';
  try {
    const obj = JSON.parse(optionsJson);
    return Object.values(obj).join(' / ');
  } catch {
    return optionsJson;
  }
}

function stockState(product) {
  const total = (product.variants || []).reduce((s, v) => s + (v.qty || 0), 0);
  if (total === 0) return 'sold';
  if (total <= 5) return 'low';
  return 'in';
}

function StockBadge({ state, overlay }) {
  const label = state === 'in' ? t('sf_in_stock') : state === 'low' ? t('sf_low') : t('sf_sold');
  return (
    <span className={`sf-stock-badge sf-stock-badge--${state}${overlay ? ' sf-stock-badge--overlay' : ''}`}>
      {label}
    </span>
  );
}

/* ===== Stars ===== */

function Stars({ value, size, onPick }) {
  return (
    <span className={`stars${onPick ? ' pick' : ''}`}>
      {[1,2,3,4,5].map(k => {
        const Tag = onPick ? 'button' : 'span';
        return (
          <Tag key={k} className={`star${value >= k ? ' on' : ''}`}
            style={size ? {fontSize: size} : undefined}
            onClick={onPick ? () => onPick(k) : undefined}
            type={onPick ? 'button' : undefined}>&#9733;</Tag>
        );
      })}
    </span>
  );
}

/* ===== Rating Stats ===== */

function ratingStats(reviews) {
  if (!reviews.length) return { avg: 0, n: 0, dist: [0,0,0,0,0] };
  const dist = [0,0,0,0,0];
  let sum = 0;
  reviews.forEach(r => { dist[r.rating - 1]++; sum += r.rating; });
  return { avg: (sum / reviews.length).toFixed(1), n: reviews.length, dist };
}

/* ===== Review Form ===== */

function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  return (
    <div className="pp-rv-form">
      <b>{t('rv_write')}</b>
      <div className="pp-rv-row">
        <span>{t('rv_your_rating')}</span>
        <Stars value={rating} size={26} onPick={setRating}/>
      </div>
      <input placeholder={t('co_name')} value={name} onChange={e => setName(e.target.value)}/>
      <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder={t('rv_text_ph')}/>
      <button className="btn btn-accent btn-sm" disabled={!rating}
        onClick={() => { onSubmit({ rating, text, name: name || t('rv_anon') }); setRating(0); setText(''); setName(''); }}>
        {t('rv_send')}
      </button>
    </div>
  );
}

/* ===== Toast ===== */

let toastTimer = null;
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type) => {
    clearTimeout(toastTimer);
    setToast({ msg, type });
    toastTimer = setTimeout(() => setToast(null), 2200);
  }, []);
  return [toast, show];
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`sf-toast${toast.type === 'error' ? ' sf-toast--error' : ''}`}>
      {toast.msg}
    </div>
  );
}

/* ===== Checkout Sheet ===== */

function CheckoutSheet({ basket, shop, onClose, onOrderSent, showToast, onUpdateQty, onRemoveItem }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState('delivery');
  const [payMethod, setPayMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const deliveryFee = delivery === 'pickup' ? 0 : 15000;
  const subtotal = basket.reduce((s, b) => s + b.qty * b.unitPrice, 0);
  const total = subtotal + deliveryFee;

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (delivery === 'delivery' && !address.trim()) return;
    setSending(true);
    try {
      const order = await api.post(`/shops/${shop.id}/orders`, {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        deliveryMethod: delivery,
        deliveryFee,
        payMethod,
        note,
        items: basket.map((b) => ({
          productId: b.productId,
          variantId: b.variantId,
          name: b.name,
          label: b.label,
          qty: b.qty,
          unitPrice: b.unitPrice,
        })),
      });
      onOrderSent(order.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error placing order', 'error');
    }
    setSending(false);
  }

  return (
    <div className="checkout-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="checkout-sheet">
        <div className="checkout-sheet__header">
          <span className="checkout-sheet__title">{t('co_checkout')}</span>
          <button className="checkout-sheet__close" type="button" onClick={onClose}>&times;</button>
        </div>

        {/* Basket items */}
        <div className="checkout-sheet__items">
          {basket.map((item, i) => (
            <div className="checkout-item" key={i}>
              <div className="checkout-item__info">
                <div className="checkout-item__name">{item.name}</div>
                {item.label && <div className="checkout-item__label">{item.label}</div>}
              </div>
              <div className="checkout-item__qty-ctrl">
                <button
                  className="checkout-item__qty-btn"
                  type="button"
                  onClick={() => item.qty <= 1 ? onRemoveItem(i) : onUpdateQty(i, item.qty - 1)}
                >
                  {item.qty <= 1 ? '✕' : '−'}
                </button>
                <span className="checkout-item__qty">{item.qty}</span>
                <button className="checkout-item__qty-btn" type="button" onClick={() => onUpdateQty(i, item.qty + 1)}>+</button>
              </div>
              <span className="checkout-item__price">{fmtPrice(item.qty * item.unitPrice)}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <div className="checkout-field">
            <label>{t('co_name')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="checkout-field">
            <label>{t('co_phone')}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className="checkout-field">
            <label>{t('co_delivery')}</label>
            <div className="checkout-radio-group">
              <button
                type="button"
                className={`checkout-radio${delivery === 'delivery' ? ' checkout-radio--active' : ''}`}
                onClick={() => setDelivery('delivery')}
              >
                {t('co_delivery_deliver')}
              </button>
              <button
                type="button"
                className={`checkout-radio${delivery === 'pickup' ? ' checkout-radio--active' : ''}`}
                onClick={() => setDelivery('pickup')}
              >
                {t('co_delivery_pickup')}
              </button>
            </div>
          </div>

          {delivery === 'delivery' && (
            <div className="checkout-field">
              <label>{t('co_address')}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
          )}

          <div className="checkout-field">
            <label>{t('co_payment')}</label>
            <div className="checkout-radio-group">
              <button
                type="button"
                className={`checkout-radio${payMethod === 'cash' ? ' checkout-radio--active' : ''}`}
                onClick={() => setPayMethod('cash')}
              >
                {t('co_pay_cash')}
              </button>
              <button
                type="button"
                className={`checkout-radio${payMethod === 'card' ? ' checkout-radio--active' : ''}`}
                onClick={() => setPayMethod('card')}
              >
                {t('co_pay_card')}
              </button>
            </div>
          </div>

          <div className="checkout-field">
            <label>{t('co_note')}</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>

          <div className="checkout-total">
            <span>{t('co_total')}</span>
            <span>{fmtPrice(total)}</span>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--block"
            disabled={sending}
          >
            {sending ? t('loading') : t('co_place')}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===== Order Success ===== */

function OrderSuccess({ order, onClose }) {
  return (
    <div className="order-success">
      <div className="order-success__icon">{'✓'}</div>
      <h2>{t('co_success')}</h2>
      <p>Order #{order.orderNo || order.id}</p>
      <p>{t('co_total')}: {fmtPrice(order.total)}</p>
      <p>The seller will confirm your order shortly.</p>
      <button className="btn btn--primary btn--lg" onClick={onClose}>
        {t('sf_back')}
      </button>
    </div>
  );
}

/* ===== Product Page ===== */

function ProductPage({ product, shop, onBack, onAddToBasket, showToast }) {
  const [galIdx, setGalIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);

  const name = getProductName(product);
  const desc = getProductDesc(product);
  const hasVariants = product.variants && product.variants.length > 0;
  const state = stockState(product);
  const bg = toneColor(product);

  const selectedVariant = hasVariants && selectedVariantIdx !== null
    ? product.variants[selectedVariantIdx]
    : null;

  const chosen = selectedVariant || (!hasVariants ? { qty: (product.variants || []).reduce((s, v) => s + (v.qty || 0), 0) } : null);
  const maxQty = chosen ? (chosen.qty || 0) : 0;

  const canAdd = hasVariants
    ? selectedVariant && (selectedVariant.qty || 0) > 0
    : state !== 'sold';

  const isSoldOut = hasVariants
    ? selectedVariant ? (selectedVariant.qty || 0) === 0 : state === 'sold'
    : state === 'sold';

  // Fetch reviews
  useEffect(() => {
    if (!shop?.id) return;
    api.get(`/shops/${shop.id}/reviews`).then(res => {
      const all = res.data || [];
      setReviews(all.filter(r => r.productId === product.id));
    }).catch(() => {});
  }, [shop?.id, product.id]);

  function handleAdd() {
    if (!canAdd) return;
    const label = selectedVariant ? parseVariantLabel(selectedVariant.optionsJson) : '';
    const unitPrice = selectedVariant?.price || product.price || 0;
    onAddToBasket({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name,
      label,
      qty,
      unitPrice,
    });
    setQty(1);
  }

  async function handleReviewSubmit(review) {
    try {
      await api.post(`/shops/${shop.id}/reviews`, {
        productId: product.id,
        rating: review.rating,
        name: review.name,
        text: review.text,
      });
      showToast(t('rv_thanks'));
      // Refetch reviews
      const res = await api.get(`/shops/${shop.id}/reviews`);
      const all = res.data || [];
      setReviews(all.filter(r => r.productId === product.id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: name, url });
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copied!');
    }
  }

  const stats = ratingStats(reviews);

  return (
    <div className="pp">
      <div className="sf-wrap">
        <button className="pp-back" type="button" onClick={onBack}>
          &#8592; {t('pp_back')}
        </button>

        <div className="pp-grid">
          {/* Gallery */}
          <div className="pp-gal">
            <StockBadge state={state} />
            {[0,1,2,3].map(k => (
              <div key={k} className={`sf-gal-frame${galIdx === k ? ' on' : ''}`}>
                {product.imageUrl && k === 0 ? (
                  <img src={product.imageUrl} alt={name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <div className="pp-img-placeholder" style={{backgroundColor: product.tone || bg}}>
                    {k === 0 && <span>{name.charAt(0)}</span>}
                  </div>
                )}
              </div>
            ))}
            <div className="sf-gal-dots">
              {[0,1,2,3].map(k => (
                <button key={k} className={`sf-gal-dot${galIdx === k ? ' on' : ''}`} onClick={() => setGalIdx(k)} type="button"/>
              ))}
            </div>
            {galIdx > 0 && <button className="sf-gal-nav prev" type="button" onClick={() => setGalIdx(galIdx - 1)}>&#8592;</button>}
            {galIdx < 3 && <button className="sf-gal-nav next" type="button" onClick={() => setGalIdx(galIdx + 1)}>&#8594;</button>}
          </div>

          {/* Info */}
          <div className="pp-info">
            <div className="pname sf-display">{name}</div>

            <div className="pp-price-row">
              <span style={{fontSize: '1.25rem', fontWeight: 700, color: 'var(--s-accent, var(--primary))'}}>
                {fmtPrice(selectedVariant?.price || product.price)}
              </span>
              {stats.n > 0 && (
                <button className="pp-rv-link" type="button" onClick={() => {
                  const el = document.getElementById('pp-reviews');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <Stars value={Math.round(parseFloat(stats.avg))} size={14} />
                  <span>{fill(t('rv_count'), { n: stats.n })}</span>
                </button>
              )}
            </div>

            {desc && (
              <div className="sf-detail-desc">{desc}</div>
            )}

            {/* Option Picker (variants) */}
            {hasVariants && (
              <div className="opt-groups">
                <div className="opt-group">
                  <div className="opt-label"><span className="sf-up">{t('sf_pick_size')}</span></div>
                  <div className="opt-values">
                    {product.variants.map((v, i) => {
                      const label = parseVariantLabel(v.optionsJson);
                      const out = (v.qty || 0) === 0;
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`opt-chip${selectedVariantIdx === i ? ' on' : ''}${out ? ' off' : ''}`}
                          disabled={out}
                          onClick={() => { setSelectedVariantIdx(i); setQty(1); }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Buy Box */}
            <div className="buy-box">
              <div className="buy-row">
                <div className="opt-label"><span className="sf-up">{t('opt_qty')}</span></div>
                <div className="qty-pick">
                  <button type="button" disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>&#8722;</button>
                  <b>{qty}</b>
                  <button type="button" disabled={qty >= maxQty} onClick={() => setQty(q => Math.min(maxQty, q + 1))}>+</button>
                </div>
                {chosen && chosen.qty > 0 && (
                  <span className={`buy-left${chosen.qty <= 5 ? ' low' : ''}`}>
                    {fill(t('opt_left'), { n: chosen.qty })}
                  </span>
                )}
              </div>

              {isSoldOut ? (
                <button className="sf-btn sf-btn-accent" disabled>
                  {t('sf_sold')}
                </button>
              ) : (
                <button
                  className="sf-btn sf-btn-accent"
                  onClick={handleAdd}
                  disabled={hasVariants && selectedVariantIdx === null}
                >
                  {t('co_add')}
                </button>
              )}
            </div>

            {/* Share */}
            <button className="pp-share-btn" type="button" onClick={handleShare}>
              &#8599; {t('sf_share')}
            </button>

            {/* Contact info */}
            <div className="pp-contact">
              {shop.telegram && (
                <span>Telegram: <a href={`https://t.me/${shop.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">@{shop.telegram.replace('@', '')}</a></span>
              )}
              {shop.phone && (
                <span>{t('ob_phone_contact')}: <a href={`tel:${shop.phone}`}>{shop.phone}</a></span>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pp-reviews" id="pp-reviews">
          <div className="pp-rv-head">
            <b>{t('rv_title')}</b>
            {stats.n > 0 && (
              <div className="pp-rv-sum">
                <Stars value={Math.round(parseFloat(stats.avg))} size={18} />
                <span>{stats.avg}</span>
                <span>{fill(t('rv_based'), { n: stats.n })}</span>
              </div>
            )}
          </div>
          <div className="pp-rv-grid">
            <div className="pp-rv-list">
              {reviews.length === 0 ? (
                <div className="pp-rv-none">
                  <p><b>{t('rv_none')}</b></p>
                  <p>{t('rv_none_d')}</p>
                </div>
              ) : (
                reviews.map((r, i) => (
                  <div className="pp-rv" key={r.id || i}>
                    <div className="pp-rv-top">
                      <b>{r.name || t('rv_anon')}</b>
                      <Stars value={r.rating} size={14} />
                      {r.createdAt && <span>{new Date(r.createdAt).toLocaleDateString()}</span>}
                    </div>
                    {r.text && <p>{r.text}</p>}
                  </div>
                ))
              )}
            </div>
            <ReviewForm onSubmit={handleReviewSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Main Page ===== */

export default function StorefrontPage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [shopConfig, setShopConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tab, setTab] = useState('products');
  const fetchShopByHandle = useShopStore((s) => s.fetchShopByHandle);
  const fetchProducts = useShopStore((s) => s.fetchProducts);

  // Basket
  const [basket, setBasket] = useState([]); // [{productId, variantId, name, label, qty, unitPrice}]
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [toast, showToast] = useToast();

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const shopData = await fetchShopByHandle(handle);
        setShop(shopData);
        if (shopData?.id) {
          await fetchProducts(shopData.id);
          const storeProducts = useShopStore.getState().products;
          setProducts(storeProducts);
          try {
            const configRes = await api.get(`/shops/${shopData.id}/config`);
            setShopConfig(configRes.data);
          } catch {
            // config may not exist
          }
        }
      } catch (e) {
        navigate('/', { replace: true });
      }
      setLoading(false);
    }
    load();
  }, [handle, fetchShopByHandle, fetchProducts, navigate]);

  const themeId = shopConfig?.theme?.toLowerCase() || 'minimal';
  const paletteId = shopConfig?.palette || 'ivory';
  const theme = getTheme(themeId);
  const palette = getPalette(paletteId);
  const themeVars = applyThemeVars(theme);
  const paletteVars = applyPaletteVars(palette);
  const styleVars = { ...themeVars, ...paletteVars };

  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => { if (p.catId) cats.add(p.catId); });
    return Array.from(cats);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.visible !== false);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => getProductName(p).toLowerCase().includes(q));
    }
    if (categoryFilter) {
      list = list.filter((p) => p.catId === categoryFilter);
    }
    if (sort === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    return list;
  }, [products, search, categoryFilter, sort]);

  const layout = shopConfig?.layout?.toLowerCase() || 'grid';

  /* ===== Basket actions ===== */

  function addToBasket(item) {
    setBasket((prev) => {
      const idx = prev.findIndex(
        (b) => b.productId === item.productId && b.variantId === item.variantId,
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + item.qty };
        return updated;
      }
      return [...prev, item];
    });
    showToast(t('co_added'));
  }

  function updateBasketQty(index, qty) {
    setBasket((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty };
      return updated;
    });
  }

  function removeBasketItem(index) {
    setBasket((prev) => prev.filter((_, i) => i !== index));
  }

  function handleOrderSent(order) {
    setShowCheckout(false);
    setBasket([]);
    setCompletedOrder(order);
  }

  function handleShare() {
    const url = `${window.location.origin}/${handle}`;
    if (navigator.share) {
      navigator.share({ title: shop?.name, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  /* ===== Renders ===== */

  if (loading) {
    return (
      <div className="sf-loading" style={styleVars}>
        <div className="sf-loading__spinner">{t('loading')}</div>
      </div>
    );
  }

  if (!shop) return null;

  // Order success screen
  if (completedOrder) {
    return (
      <div className="storefront" style={styleVars}>
        <div className="sf-container">
          <OrderSuccess
            order={completedOrder}
            onClose={() => { setCompletedOrder(null); setSelectedProduct(null); }}
          />
        </div>
      </div>
    );
  }

  // Product page (full page, not drawer/modal)
  if (selectedProduct) {
    return (
      <div className="storefront" style={styleVars}>
        <ProductPage
          product={selectedProduct}
          shop={shop}
          onBack={() => setSelectedProduct(null)}
          onAddToBasket={addToBasket}
          showToast={showToast}
        />
        {/* Basket dock */}
        {basket.length > 0 && !showCheckout && (
          <div className="basket-dock">
            <span className="basket-dock__summary">
              {basket.reduce((s, b) => s + b.qty, 0)} {t('co_items')} &middot; {fmtPrice(basket.reduce((s, b) => s + b.qty * b.unitPrice, 0))}
            </span>
            <button className="btn btn--primary btn--sm" onClick={() => setShowCheckout(true)}>
              {t('co_checkout')} &rarr;
            </button>
          </div>
        )}
        {showCheckout && (
          <CheckoutSheet
            basket={basket}
            shop={shop}
            onClose={() => setShowCheckout(false)}
            onOrderSent={handleOrderSent}
            showToast={showToast}
            onUpdateQty={updateBasketQty}
            onRemoveItem={removeBasketItem}
          />
        )}
        <Toast toast={toast} />
      </div>
    );
  }

  // Main listing
  return (
    <div className="storefront" style={styleVars}>
      {/* Cover */}
      <div
        className="sf-cover"
        style={{
          backgroundImage: shop.coverUrl ? `url(${shop.coverUrl})` : 'none',
          backgroundColor: shop.coverUrl ? undefined : (shop.coverColor || 'var(--s-line)'),
        }}
      />

      {/* Header */}
      <div className="sf-container">
        <div className="sf-header">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt={shop.name} className="sf-header__avatar" />
          ) : (
            <div className="sf-header__avatar sf-header__avatar--placeholder">
              {shop.initials || shop.name?.charAt(0)}
            </div>
          )}
          <div className="sf-header__info">
            <h1 className="sf-header__name">{shop.name}</h1>
            <p className="sf-header__handle">rasta.uz/{shop.handle}</p>
          </div>
          <div className="sf-header__actions">
            <button className="btn btn--outline btn--sm" onClick={handleShare}>
              {t('sf_share')}
            </button>
            {shop.telegram && (
              <a
                className="btn btn--primary btn--sm"
                href={`https://t.me/${shop.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('sf_chat')}
              </a>
            )}
            <LangPill />
          </div>
        </div>

        {/* Tabs */}
        <div className="sf-tabs">
          <button
            className={`sf-tabs__btn ${tab === 'products' ? 'sf-tabs__btn--active' : ''}`}
            onClick={() => setTab('products')}
            type="button"
          >
            {t('sf_products')} ({filtered.length})
          </button>
          <button
            className={`sf-tabs__btn ${tab === 'about' ? 'sf-tabs__btn--active' : ''}`}
            onClick={() => setTab('about')}
            type="button"
          >
            {t('sf_about')}
          </button>
        </div>

        {tab === 'products' && (
          <>
            {/* Filters */}
            <div className="sf-filters">
              <input
                type="text"
                className="sf-filters__search"
                placeholder={t('sf_search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="sf-filters__cats">
                <button
                  className={`sf-cat-pill ${!categoryFilter ? 'sf-cat-pill--active' : ''}`}
                  onClick={() => setCategoryFilter('')}
                  type="button"
                >
                  {t('sf_all')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`sf-cat-pill ${categoryFilter === cat ? 'sf-cat-pill--active' : ''}`}
                    onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <select
                className="sf-filters__sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="default">{t('sf_all')}</option>
                <option value="price-asc">{t('db_price')} &#8593;</option>
                <option value="price-desc">{t('db_price')} &#8595;</option>
              </select>
            </div>

            {/* Products */}
            {filtered.length === 0 ? (
              <EmptyState icon="&#128722;" title={t('sf_empty')} />
            ) : (
              <div className={`sf-products sf-products--${layout}`}>
                {filtered.map((product) => {
                  const name = getProductName(product);
                  const state = stockState(product);
                  const bg = toneColor(product);
                  return (
                    <div
                      key={product.id}
                      className={`sf-product-card sf-product-card--${layout}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="sf-product-card__img">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={name} />
                        ) : (
                          <div className="sf-product-card__no-img--toned" style={{ background: bg }}>
                            {name?.charAt(0)}
                          </div>
                        )}
                        <StockBadge state={state} overlay />
                      </div>
                      <div className="sf-product-card__info">
                        <h3 className="sf-product-card__name">{name}</h3>
                        <span className="sf-product-card__price">{fmtPrice(product.price)}</span>
                        {product.variants?.length > 0 && (
                          <div className="sf-product-card__sizes">
                            {product.variants.slice(0, 4).map((v, i) => (
                              <span key={i} className="sf-product-card__size">
                                {parseVariantLabel(v.optionsJson)}
                              </span>
                            ))}
                            {product.variants.length > 4 && (
                              <span className="sf-product-card__size">+{product.variants.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'about' && (
          <div className="sf-about">
            {shop.location && <p><strong>{t('ob_city')}:</strong> {shop.location}</p>}
            {shop.telegram && <p><strong>Telegram:</strong> @{shop.telegram.replace('@', '')}</p>}
            {shop.instagram && <p><strong>Instagram:</strong> @{shop.instagram.replace('@', '')}</p>}
            {shop.phone && <p><strong>{t('ob_phone_contact')}:</strong> {shop.phone}</p>}
          </div>
        )}
      </div>

      {/* Basket dock */}
      {basket.length > 0 && !showCheckout && (
        <div className="basket-dock">
          <span className="basket-dock__summary">
            {basket.reduce((s, b) => s + b.qty, 0)} {t('co_items')} &middot; {fmtPrice(basket.reduce((s, b) => s + b.qty * b.unitPrice, 0))}
          </span>
          <button className="btn btn--primary btn--sm" onClick={() => setShowCheckout(true)}>
            {t('co_checkout')} &rarr;
          </button>
        </div>
      )}

      {/* Checkout */}
      {showCheckout && (
        <CheckoutSheet
          basket={basket}
          shop={shop}
          onClose={() => setShowCheckout(false)}
          onOrderSent={handleOrderSent}
          showToast={showToast}
          onUpdateQty={updateBasketQty}
          onRemoveItem={removeBasketItem}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
