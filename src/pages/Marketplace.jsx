import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { t, fill, onLangChange, getLang } from '../i18n';
import { useShopStore } from '../store/shopStore';
import { shopTypes as fallbackShopTypes, fetchShopTypes, getCategoryName, getShopType, cities } from '../data/types';
import '../styles/marketplace.css';

const SORT_OPTIONS = [
  { value: '', label: 'mp_sort_newest' },
  { value: 'products', label: 'mp_sort_products' },
  { value: 'rating', label: 'mp_sort_rating' },
];

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

  function getTagline(shop) {
    if (!shop.tagline) return '';
    const lang = getLang();
    return shop.tagline[lang] || shop.tagline.en || shop.tagline.uz || '';
  }

  function getTypeBadge(shop) {
    if (!shop.type) return null;
    const st = getShopType(shop.type);
    return st ? getCategoryName(st) : null;
  }

  return (
    <div className="marketplace">
      <Navbar />
      <div className="marketplace__content container">
        <h1 className="marketplace__title">{t('mp_title')}</h1>

        <div className="marketplace__filters">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input marketplace__search"
              placeholder={t('mp_search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-input"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ maxWidth: 180 }}
            >
              <option value="">{t('mp_all_cities')}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ maxWidth: 180 }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(o.label)}</option>
              ))}
            </select>
            {dirty && (
              <button className="btn btn-ghost btn-sm mp-clear-btn" onClick={clearAll} type="button">
                &#10005; {t('mp_clear')}
              </button>
            )}
          </div>
          <div className="marketplace__types">
            <button
              className={`type-pill ${!typeFilter ? 'type-pill--active' : ''}`}
              onClick={() => setTypeFilter('')}
              type="button"
            >
              {t('mp_all')}
            </button>
            {shopTypes.map((st) => (
              <button
                key={st.id}
                className={`type-pill ${typeFilter === st.id ? 'type-pill--active' : ''}`}
                onClick={() => setTypeFilter(st.id === typeFilter ? '' : st.id)}
                type="button"
              >
                {getCategoryName(st)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="marketplace__loading">{t('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="marketplace__empty-state">
            <div className="marketplace__empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="marketplace__empty-title">{t('mp_no_results')}</h3>
            <p className="marketplace__empty-desc">{t('mp_no_results_d')}</p>
            {dirty && (
              <button className="btn btn-ghost btn-sm" onClick={clearAll} type="button">
                {t('mp_clear')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="marketplace__result-count">
              {fill(t('mp_showing'), { n: filtered.length })}
            </div>
            <div className="marketplace__grid">
              {filtered.map((shop) => {
                const tagline = getTagline(shop);
                const typeBadge = getTypeBadge(shop);
                return (
                  <Link key={shop.id || shop.handle} to={`/${shop.handle}`} className="shop-card">
                    <div
                      className="shop-card__cover"
                      style={{
                        backgroundImage: shop.coverUrl ? `url(${shop.coverUrl})` : 'none',
                        backgroundColor: shop.coverUrl ? undefined : (shop.coverColor || '#e8e8e4'),
                      }}
                    >
                      {typeBadge && (
                        <span className="shop-card__type-badge">{typeBadge}</span>
                      )}
                      {shop.logoUrl ? (
                        <img src={shop.logoUrl} alt={shop.name} className="shop-card__avatar" />
                      ) : (
                        <div className="shop-card__avatar-initials">
                          {shop.initials || shop.name?.charAt(0) || ''}
                        </div>
                      )}
                    </div>
                    <div className="shop-card__body">
                      <h3 className="shop-card__name">{shop.name}</h3>
                      {tagline && <p className="shop-card__tagline">{tagline}</p>}
                      <p className="shop-card__handle">labaratory.rastashops.com/{shop.handle}</p>
                      <div className="shop-card__meta">
                        {shop.location && (
                          <span className="shop-card__location">{shop.location}</span>
                        )}
                        {shop.rating > 0 && (
                          <span className="shop-card__rating">
                            <span className="shop-card__star">&#9733;</span> {Number(shop.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="shop-card__footer">
                        {typeof shop.productCount === 'number' ? (
                          <span className="shop-card__count">
                            {shop.productCount} {t('mp_products_count')}
                          </span>
                        ) : shop.products?.length != null ? (
                          <span className="shop-card__count">
                            {shop.products.length} {t('mp_products_count')}
                          </span>
                        ) : null}
                        <span className="shop-card__open-label">{t('mp_open')} &rarr;</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
