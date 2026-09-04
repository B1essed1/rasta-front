import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { t, onLangChange } from '../i18n';
import { useShopStore } from '../store/shopStore';
import { shopTypes } from '../data/types';
import '../styles/marketplace.css';

export default function Marketplace() {
  const [, setTick] = useState(0);
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const fetchAllShops = useShopStore((s) => s.fetchAllShops);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllShops({ search, type: typeFilter });
        setShops(Array.isArray(data) ? data : []);
      } catch {
        setShops([]);
      }
      setLoading(false);
    }
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search, typeFilter, fetchAllShops]);

  const filtered = shops.filter((shop) => {
    const matchesSearch =
      !search ||
      shop.name?.toLowerCase().includes(search.toLowerCase()) ||
      shop.handle?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || shop.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="marketplace">
      <Navbar />
      <div className="marketplace__content container">
        <h1 className="marketplace__title">{t('mp_title')}</h1>

        <div className="marketplace__filters">
          <input
            type="text"
            className="form-input marketplace__search"
            placeholder={t('mp_search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                {st.icon} {t(st.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="marketplace__loading">{t('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="marketplace__empty">{t('mp_no_results')}</div>
        ) : (
          <div className="marketplace__grid">
            {filtered.map((shop) => (
              <Link key={shop.id || shop.handle} to={`/${shop.handle}`} className="shop-card">
                <div
                  className="shop-card__cover"
                  style={{
                    backgroundImage: shop.coverUrl ? `url(${shop.coverUrl})` : 'none',
                    backgroundColor: shop.coverUrl ? undefined : '#e8e8e4',
                  }}
                >
                  {shop.logoUrl && (
                    <img src={shop.logoUrl} alt={shop.name} className="shop-card__avatar" />
                  )}
                </div>
                <div className="shop-card__body">
                  <h3 className="shop-card__name">{shop.name}</h3>
                  <p className="shop-card__handle">rasta.uz/{shop.handle}</p>
                  {shop.productCount != null && (
                    <span className="shop-card__count">
                      {shop.productCount} {t('mp_products_count')}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
