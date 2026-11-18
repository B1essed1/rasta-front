import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { t, fill, onLangChange, getLang } from '../i18n';
import { useShopStore } from '../store/shopStore';
import { shopTypes as fallbackShopTypes, fetchShopTypes, getCategoryName, getShopType, cities } from '../data/types';
import { I } from '../components/ui/Icons';
import '../styles/marketplace.css';

const SORT_OPTIONS = [
  { value: '', label: 'mp_sort_newest' },
  { value: 'products', label: 'mp_sort_products' },
  { value: 'rating', label: 'mp_sort_rating' },
];

/* ===== Shop Card (prototype MktCard) ===== */

function ShopCard({ shop }) {
  const lang = getLang();

  function getTagline() {
    if (!shop.tagline) return '';
    return shop.tagline[lang] || shop.tagline.en || shop.tagline.uz || '';
  }

  function getTypeBadge() {
    if (!shop.type) return null;
    const st = getShopType(shop.type);
    return st ? getCategoryName(st) : null;
  }

  const tagline = getTagline();
  const typeBadge = getTypeBadge();
  const rating = shop.rating ? Number(shop.rating).toFixed(1) : '5.0';
  const productCount = typeof shop.productCount === 'number'
    ? shop.productCount
    : (shop.products?.length ?? 0);

  return (
    <Link to={`/${shop.handle}`} className="mkt-card">
      {/* Cover image with watermark */}
      <div
        className="mkt-cover"
        style={{
          backgroundImage: shop.coverUrl ? `url(${shop.coverUrl})` : 'none',
          backgroundColor: shop.coverUrl ? undefined : (shop.coverColor || '#e8e8e4'),
        }}
      >
        <div className="mkt-cover-wm">{shop.name}</div>
        {typeBadge && (
          <span className="mkt-type">{typeBadge}</span>
        )}
      </div>

      {/* Body */}
      <div className="mkt-body">
        {/* Logo overlapping the cover bottom */}
        <div className="mkt-logo">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt={shop.name} />
          ) : (
            <span className="mkt-logo-init">{shop.initials || shop.name?.charAt(0) || ''}</span>
          )}
        </div>

        {/* Name + handle + rating */}
        <div className="mkt-head">
          <div className="mkt-head-id">
            <div className="mkt-name">{shop.name}</div>
            <div className="mkt-handle">@{shop.handle}</div>
          </div>
          <span className="mkt-rating">
            <span className="mkt-star">&#9733;</span>{rating}
          </span>
        </div>

        {/* Tagline */}
        {tagline && <div className="mkt-tag">{tagline}</div>}

        {/* Footer: location + product count + open link */}
        <div className="mkt-foot">
          <span className="mkt-meta">
            {I.store({ width: 14, height: 14 })}
            <span>
              {shop.location && <>{shop.location} &middot; </>}
              {productCount} {t('mp_products_count')}
            </span>
          </span>
          <span className="mkt-open">
            {t('mp_open')} {I.arrow({ width: 14, height: 14 })}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ===== Marketplace ===== */

export default function Marketplace() {
  const [, setTick] = useState(0);
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [shopTypes, setShopTypes] = useState(fallbackShopTypes);
  const fetchAllShops = useShopStore((s) => s.fetchAllShops);
  const chipsRef = useRef(null);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    fetchShopTypes().then(setShopTypes);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllShops({ search, type: typeFilter, city: cityFilter, sort: sortBy });
        setShops(Array.isArray(data) ? data : []);
      } catch {
        setShops([]);
      }
      setLoading(false);
    }
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search, typeFilter, cityFilter, sortBy, fetchAllShops]);

  const filtered = shops.filter((shop) => {
    const matchesSearch =
      !search ||
      shop.name?.toLowerCase().includes(search.toLowerCase()) ||
      shop.handle?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || shop.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const dirty = search || typeFilter || cityFilter || sortBy;

  function clearAll() {
    setSearch('');
    setTypeFilter('');
    setCityFilter('');
    setSortBy('');
  }

  // Count shops per type
  function typeCount(typeId) {
    return shops.filter((s) => s.type === typeId).length;
  }

  return (
    <div className="mkt">
      <Navbar />

      {/* ===== Hero section ===== */}
      <div className="mkt-hero">
        <div className="container">
          <span className="mkt-kicker">{t('mp_kicker')}</span>
          <h1 className="mkt-hero-title">{t('mp_hero_title')}</h1>
          <p className="mkt-hero-sub">{t('mp_hero_sub')}</p>
          <div className="mkt-search">
            {I.search({ width: 18, height: 18 })}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('mp_search')}
            />
          </div>
        </div>
      </div>

      {/* ===== Filter bar ===== */}
      <div className="mkt-filters">
        <div className="container">
          {/* Type chip strip (horizontal scrollable) */}
          <div className="mkt-chips" ref={chipsRef}>
            <button
              className={`mkt-chip${!typeFilter ? ' on' : ''}`}
              onClick={() => setTypeFilter('')}
              type="button"
            >
              {t('mp_all')} <span className="mkt-chip-ct">{shops.length}</span>
            </button>
            {shopTypes.map((st) => (
              <button
                key={st.id}
                className={`mkt-chip${typeFilter === st.id ? ' on' : ''}`}
                onClick={() => setTypeFilter(st.id === typeFilter ? '' : st.id)}
                type="button"
              >
                {getCategoryName(st)} <span className="mkt-chip-ct">{typeCount(st.id)}</span>
              </button>
            ))}
          </div>

          {/* City + Sort selects + Clear */}
          <div className="mkt-selects">
            <select
              className="mkt-select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">{t('mp_all_cities')}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="mkt-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(o.label)}</option>
              ))}
            </select>
            {dirty && (
              <button className="mkt-clear-link" onClick={clearAll} type="button">
                {I.x({ width: 14, height: 14 })} {t('mp_clear')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== Results ===== */}
      <div className="mkt-results container">
        {loading ? (
          <div className="mkt-loading">{t('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="mkt-empty">
            <div className="mkt-empty-icon">
              {I.search({ width: 24, height: 24 })}
            </div>
            <b>{t('mp_no_results')}</b>
            <p>{t('mp_no_results_d')}</p>
            {dirty && (
              <button className="btn btn-ghost btn-sm" onClick={clearAll} type="button">
                {t('mp_clear')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mkt-count">
              {fill(t('mp_showing'), { n: filtered.length })}
            </div>
            <div className="mkt-grid">
              {filtered.map((shop) => (
                <ShopCard key={shop.id || shop.handle} shop={shop} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
