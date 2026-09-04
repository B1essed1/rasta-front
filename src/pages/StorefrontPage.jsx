import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LangPill from '../components/ui/LangPill';
import EmptyState from '../components/ui/EmptyState';
import { t, onLangChange, fmtPrice } from '../i18n';
import { useShopStore } from '../store/shopStore';
import { getTheme, applyThemeVars } from '../data/themes';
import { getPalette, applyPaletteVars } from '../data/palettes';
import '../styles/storefront.css';

function ProductDetail({ product, shop, onBack }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const images = product.photos?.length ? product.photos : [product.imageUrl].filter(Boolean);

  function handleOrder() {
    const tgUser = shop.telegram?.replace('@', '') || '';
    const sizePart = selectedSize ? ` | ${t('sf_size')}: ${selectedSize}` : '';
    const msg = encodeURIComponent(`${product.name}${sizePart} — ${fmtPrice(product.price)}`);
    window.open(`https://t.me/${tgUser}?text=${msg}`, '_blank');
  }

  return (
    <div className="sf-detail">
      <button className="sf-detail__back" onClick={onBack} type="button">
        &#8592; {t('sf_back')}
      </button>
      <div className="sf-detail__layout">
        <div className="sf-detail__gallery">
          {images.length > 0 ? (
            <>
              <div className="sf-detail__main-img">
                <img src={images[selectedImage]} alt={product.name} />
              </div>
              {images.length > 1 && (
                <div className="sf-detail__thumbs">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className={`sf-detail__thumb ${i === selectedImage ? 'sf-detail__thumb--active' : ''}`}
                      onClick={() => setSelectedImage(i)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="sf-detail__no-img">No image</div>
          )}
        </div>
        <div className="sf-detail__info">
          <h2 className="sf-detail__name">{product.name}</h2>
          <div className="sf-detail__price">{fmtPrice(product.price)}</div>

          {product.variants?.length > 0 && (
            <div className="sf-detail__sizes">
              <label>{t('sf_pick_size')}</label>
              <div className="sf-detail__size-grid">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`size-btn ${selectedSize === v.label ? 'size-btn--active' : ''} ${v.stock === 0 ? 'size-btn--out' : ''}`}
                    disabled={v.stock === 0}
                    onClick={() => setSelectedSize(v.label)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn--primary btn--lg btn--block sf-detail__order" onClick={handleOrder}>
            {t('sf_order_tg')}
          </button>

          {product.description && (
            <div className="sf-detail__desc">
              <h3>{t('sf_desc')}</h3>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StorefrontPage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tab, setTab] = useState('products');
  const fetchShopByHandle = useShopStore((s) => s.fetchShopByHandle);
  const fetchProducts = useShopStore((s) => s.fetchProducts);

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
        }
      } catch (e) {
        navigate('/', { replace: true });
      }
      setLoading(false);
    }
    load();
  }, [handle, fetchShopByHandle, fetchProducts, navigate]);

  const theme = getTheme(shop?.themeId || 'minimal');
  const palette = getPalette(shop?.paletteId || 'ivory');
  const themeVars = applyThemeVars(theme);
  const paletteVars = applyPaletteVars(palette);
  const styleVars = { ...themeVars, ...paletteVars };

  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.visible !== false);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }
    if (sort === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    return list;
  }, [products, search, categoryFilter, sort]);

  const layout = theme.layout || 'grid';

  function handleShare() {
    const url = `${window.location.origin}/${handle}`;
    if (navigator.share) {
      navigator.share({ title: shop?.name, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  if (loading) {
    return (
      <div className="sf-loading" style={styleVars}>
        <div className="sf-loading__spinner">{t('loading')}</div>
      </div>
    );
  }

  if (!shop) return null;

  if (selectedProduct) {
    return (
      <div className="storefront" style={styleVars}>
        <div className="sf-container">
          <ProductDetail
            product={selectedProduct}
            shop={shop}
            onBack={() => setSelectedProduct(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="storefront" style={styleVars}>
      {/* Cover */}
      <div
        className="sf-cover"
        style={{
          backgroundImage: shop.coverUrl ? `url(${shop.coverUrl})` : 'none',
          backgroundColor: shop.coverUrl ? undefined : 'var(--s-line)',
        }}
      />

      {/* Header */}
      <div className="sf-container">
        <div className="sf-header">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt={shop.name} className="sf-header__avatar" />
          ) : (
            <div className="sf-header__avatar sf-header__avatar--placeholder">
              {shop.name?.charAt(0)}
            </div>
          )}
          <div className="sf-header__info">
            <h1 className="sf-header__name">{shop.name}</h1>
            <p className="sf-header__handle">rasta.uz/{shop.handle}</p>
            {shop.bio && <p className="sf-header__bio">{shop.bio}</p>}
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
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className={`sf-product-card sf-product-card--${layout}`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="sf-product-card__img">
                      {(product.imageUrl || product.photos?.[0]) ? (
                        <img src={product.photos?.[0] || product.imageUrl} alt={product.name} />
                      ) : (
                        <div className="sf-product-card__no-img">
                          {product.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="sf-product-card__info">
                      <h3 className="sf-product-card__name">{product.name}</h3>
                      <span className="sf-product-card__price">{fmtPrice(product.price)}</span>
                      {product.variants?.length > 0 && (
                        <div className="sf-product-card__sizes">
                          {product.variants.slice(0, 4).map((v, i) => (
                            <span key={i} className="sf-product-card__size">{v.label}</span>
                          ))}
                          {product.variants.length > 4 && (
                            <span className="sf-product-card__size">+{product.variants.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'about' && (
          <div className="sf-about">
            {shop.bio && <p>{shop.bio}</p>}
            {shop.city && <p><strong>{t('ob_city')}:</strong> {shop.city}</p>}
            {shop.telegram && <p><strong>Telegram:</strong> @{shop.telegram.replace('@', '')}</p>}
            {shop.instagram && <p><strong>Instagram:</strong> @{shop.instagram.replace('@', '')}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
