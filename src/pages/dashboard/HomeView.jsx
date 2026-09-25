import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, fill, getLang, onLangChange } from '../../i18n';
import { I } from '../../components/ui/Icons';
import { toast } from '../../components/ui/ToastHost';
import { useShopStore, stockState } from '../../store/shopStore';
import api from '../../api/client';

const CURRENCY = { en: 'soʼm', ru: 'сум', uz: 'soʼm' };
const DAY = 86400000;

// Same grouping the design uses: ru-RU digit groups, narrow no-break space.
function fmtNum(n) {
  return Number(n || 0)
    .toLocaleString('ru-RU')
    .replace(/[, ]/g, ' ');
}


export default function HomeView() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();

  const shop = useShopStore((s) => s.shop);
  const stats = useShopStore((s) => s.stats);
  const products = useShopStore((s) => s.products);
  const orders = useShopStore((s) => s.orders);
  const sales = useShopStore((s) => s.sales);
  const fetchShop = useShopStore((s) => s.fetchShop);
  const fetchStats = useShopStore((s) => s.fetchStats);
  const fetchProducts = useShopStore((s) => s.fetchProducts);
  const fetchOrders = useShopStore((s) => s.fetchOrders);
  const fetchSales = useShopStore((s) => s.fetchSales);

  useEffect(() => onLangChange(() => setTick((x) => x + 1)), []);

  useEffect(() => {
    if (!shop?.id) return;
    fetchStats();
    fetchProducts();
    fetchOrders();
    fetchSales();
  }, [shop?.id, fetchStats, fetchProducts, fetchOrders, fetchSales]);

  const lang = getLang();
  const handle = shop?.handle || '';
  const url = 'rastashops.com/' + handle;
  const live = (shop?.status || 'DRAFT').toUpperCase() === 'LIVE';

  // ---- this month -------------------------------------------------------
  const monthAgo = Date.now() - 30 * DAY;
  const at = (x) => (x?.createdAt ? new Date(x.createdAt).getTime() : 0);
  const monthSales = (sales || []).filter((s) => at(s) >= monthAgo);

  const salesRev = monthSales.reduce((n, s) => n + Number(s.total || 0), 0);
  const soldFromLines = monthSales.reduce((n, s) => {
    const lines = s.lines || s.items;
    if (!Array.isArray(lines)) return n;
    return n + lines.reduce((m, l) => m + ((l.qty || 0) - (l.returned || 0)), 0);
  }, 0);

  const monthOrders = (orders || []).filter((o) => at(o) >= monthAgo);
  const ordersRev = monthOrders.reduce((n, o) => n + Number(o.total || o.goodsTotal || 0), 0);
  const ordersSold = monthOrders.reduce((n, o) => {
    const lines = o.items || [];
    return n + lines.reduce((m, l) => m + (l.qty || 0), 0);
  }, 0);

  const rev = salesRev || ordersRev;
  const sold = soldFromLines || ordersSold;

  const visitors = Number(stats?.visitors ?? stats?.views ?? 0);
  const rawViews = stats?.productViews;
  const pViews =
    rawViews && typeof rawViews === 'object'
      ? Object.values(rawViews).reduce((n, x) => n + Number(x || 0), 0)
      : Number(rawViews || 0);

  const stats4 = [
    { lab: t('db_visitors'), val: fmtNum(visitors), ic: I.eye },
    { lab: t('hm_pviews'), val: fmtNum(pViews), ic: I.grid },
    { lab: t('hm_items_sold'), val: fmtNum(sold), ic: I.bag },
    { lab: t('hm_revenue') + ' · ' + (CURRENCY[lang] || CURRENCY.en), val: fmtNum(rev), ic: I.wallet },
  ];

  // ---- needs your attention --------------------------------------------
  const newOrders = (orders || []).filter((o) => String(o.status).toUpperCase() === 'NEW');
  const staleAfter = Date.now() - DAY;
  const oc = {
    new: newOrders.length,
    stale: newOrders.filter((o) => at(o) && at(o) < staleAfter).length,
  };
  const out = (products || []).filter((p) => stockState(p) === 'sold');
  const low = (products || []).filter((p) => stockState(p) === 'low');
  const incomplete = (products || []).filter((p) => !(p.descEn || p.descRu || p.descUz));

  const goOrders = () => navigate('/dashboard/orders');
  const goProducts = () => navigate('/dashboard/products');
  // The app has no /dashboard/inventory route yet (the shell renders inventory as a
  // non-routed placeholder tab), so the stock CTAs land on the products page.
  const goInventory = goProducts;

  const attn = [];
  if (oc.new)
    attn.push({ ic: I.bag, txt: fill(t('or_new_badge'), { n: oc.new }), cta: t('db_orders'), go: goOrders, tone: 'accent' });
  if (oc.stale)
    attn.push({ ic: I.clock, txt: fill(t('or_stale_badge'), { n: oc.stale }), cta: t('db_orders'), go: goOrders, tone: 'alert' });
  if (out.length)
    attn.push({ ic: I.warn, txt: fill(t('hm_soldout'), { n: out.length }), cta: t('hm_view_inv'), go: goInventory, tone: 'alert' });
  if (low.length)
    attn.push({ ic: I.box, txt: fill(t('hm_low'), { n: low.length }), cta: t('hm_view_inv'), go: goInventory, tone: 'saffron' });
  if (incomplete.length)
    attn.push({ ic: I.edit, txt: fill(t('hm_incomplete'), { n: incomplete.length }), cta: t('db_fix'), go: goProducts, tone: 'plain' });

  // ---- actions ----------------------------------------------------------
  function copyLink() {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(url);
    } catch (e) {
      /* clipboard unavailable */
    }
    toast(t('db_copied'));
  }

  function onVisit() {
    if (handle) window.open('/' + handle, '_blank', 'noopener');
  }

  async function publish() {
    if (!shop?.id) return;
    try {
      await api.put(`/shops/${shop.id}`, { status: 'LIVE' });
      await fetchShop(shop.id);
      toast(t('db_shop_published'));
    } catch (e) {
      toast(e.serverMessage || 'Error', 'error');
    }
  }

  return (
    <div className="home">
      <div className="home-hello">
        <h2>
          {t('db_hello')}, <span>{shop?.name || ''}</span>
        </h2>
        <p>{t('db_today_sub')}</p>
      </div>

      <div className={'status-card ' + (live ? 'live' : 'draft')}>
        <div className="sc-row">
          <div className={'sc-badge' + (live ? ' live' : '')}>
            {live ? I.check({ width: 20, height: 20 }) : I.store({ width: 20, height: 20 })}
          </div>
          <div className="sc-txt">
            <b>{live ? t('db_live') : t('sf_closed_t')}</b>
            <span>{live ? t('db_live_d') : t('st_paused_d')}</span>
          </div>
          {!live && (
            <button className="btn btn-accent btn-sm" onClick={publish} type="button">
              {t('db_publish_shop')}
            </button>
          )}
        </div>
        <div className="sc-link">
          <span className="sc-url">
            {I.globe({ width: 15, height: 15 })} <span>{url}</span>
          </span>
          <div className="sc-link-acts">
            <button className="btn btn-soft btn-sm" onClick={copyLink} type="button">
              {I.copy({ width: 15, height: 15 })} {t('db_copy')}
            </button>
            <button className="btn btn-accent btn-sm" onClick={onVisit} type="button">
              {I.eye({ width: 15, height: 15 })} {t('db_open_shop')}
            </button>
          </div>
        </div>
      </div>

      <div className="home-sec-t">{t('db_attention')}</div>
      {attn.length ? (
        <div className="attn-list">
          {attn.map((a, i) => (
            <div key={i} className={'attn ' + a.tone} onClick={a.go}>
              <div className="attn-ic">{a.ic({ width: 18, height: 18 })}</div>
              <span className="attn-txt">{a.txt}</span>
              <button className="attn-cta" type="button">
                {a.cta} {I.arrow({ width: 14, height: 14 })}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="attn-empty">
          {I.check({ width: 16, height: 16 })} {t('db_all_good')}
        </div>
      )}

      <div className="home-sec-t">{t('db_overview')}</div>
      <div className="mini-stats four">
        {stats4.map((s, i) => (
          <div key={i} className="mini-stat">
            <div className="ms-ic">{s.ic({ width: 17, height: 17 })}</div>
            <div className="ms-val">{s.val}</div>
            <div className="ms-lab">{s.lab}</div>
          </div>
        ))}
      </div>

      <div className="home-sec-t">{t('db_quick')}</div>
      <div className="quick-actions">
        <button className="qa" onClick={goProducts} type="button">
          <span className="qa-ic accent">{I.plus({ width: 20, height: 20 })}</span>
          {t('db_add')}
        </button>
        {/* The app has no POS/scan screen yet; the sales page is the nearest real route. */}
        <button className="qa" onClick={() => navigate('/dashboard/sales')} type="button">
          <span className="qa-ic accent">{I.scan({ width: 20, height: 20 })}</span>
          {t('db_scan')}
        </button>
        <button className="qa" onClick={() => navigate('/dashboard/design')} type="button">
          <span className="qa-ic">{I.palette({ width: 20, height: 20 })}</span>
          {t('db_design')}
        </button>
        <button className="qa" onClick={copyLink} type="button">
          <span className="qa-ic">{I.share({ width: 20, height: 20 })}</span>
          {t('db_share')}
        </button>
      </div>
    </div>
  );
}
