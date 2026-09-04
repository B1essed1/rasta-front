import React, { useState, useEffect, useRef, useCallback } from 'react';
import { t, onLangChange, fmtPrice } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';
import ProductModal from './ProductModal';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/ToastHost';

export default function ProductsView() {
  const [, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);

  const shop = useShopStore((s) => s.shop);
  const products = useShopStore((s) => s.products);
  const fetchProducts = useShopStore((s) => s.fetchProducts);
  const deleteProduct = useShopStore((s) => s.deleteProduct);
  const reorderProducts = useShopStore((s) => s.reorderProducts);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (shop?.id) fetchProducts();
  }, [shop?.id, fetchProducts]);

  const filtered = products.filter((p) => {
    const name = p.nameEn || p.nameUz || p.nameRu || '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'published') return matchSearch && p.visible !== false;
    if (filter === 'hidden') return matchSearch && p.visible === false;
    return matchSearch;
  });

  function handleEdit(product) {
    setEditProduct(product);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditProduct(null);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await deleteProduct(deleteConfirm.id);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
    setDeleteConfirm(null);
  }

  function handleDragStart(idx) {
    setDragIdx(idx);
  }

  function handleDragOver(e, idx) {
    e.preventDefault();
  }

  function handleDrop(e, targetIdx) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newList = [...filtered];
    const [moved] = newList.splice(dragIdx, 1);
    newList.splice(targetIdx, 0, moved);
    reorderProducts(newList.map((p) => p.id));
    setDragIdx(null);
  }

  return (
    <div className="products-view">
      <div className="products-view__header">
        <h1>{t('db_products')}</h1>
        <button className="btn btn--primary" onClick={handleAdd}>
          + {t('db_add')}
        </button>
      </div>

      <div className="products-view__filters">
        <input
          type="text"
          className="form-input"
          placeholder={t('sf_search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="products-view__tabs">
          {['all', 'published', 'hidden'].map((f) => (
            <button
              key={f}
              className={`tab-btn ${filter === f ? 'tab-btn--active' : ''}`}
              onClick={() => setFilter(f)}
              type="button"
            >
              {f === 'all' ? t('sf_all') : f === 'published' ? t('db_published') : t('db_hidden')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="&#128722;"
          title={t('sf_empty')}
          action={
            <button className="btn btn--primary" onClick={handleAdd}>
              + {t('db_add')}
            </button>
          }
        />
      ) : (
        <div className="products-table">
          <div className="products-table__header">
            <span className="products-table__col--drag" />
            <span className="products-table__col--img" />
            <span className="products-table__col--name">{t('db_name')}</span>
            <span className="products-table__col--price">{t('db_price')}</span>
            <span className="products-table__col--stock">{t('db_stock')}</span>
            <span className="products-table__col--status">{t('or_status')}</span>
            <span className="products-table__col--actions" />
          </div>
          {filtered.map((product, idx) => (
            <div
              key={product.id}
              className="products-table__row"
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
            >
              <span className="products-table__col--drag">&#9776;</span>
              <span className="products-table__col--img">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="products-table__thumb" />
                ) : (
                  <div className="products-table__thumb products-table__thumb--empty">
                    {(product.nameEn || product.nameUz || '')?.charAt(0)}
                  </div>
                )}
              </span>
              <span className="products-table__col--name">{product.nameEn || product.nameUz || product.nameRu || ''}</span>
              <span className="products-table__col--price">{fmtPrice(product.price)}</span>
              <span className="products-table__col--stock">{product.variants?.reduce((sum, v) => sum + (v.qty || 0), 0) ?? '—'}</span>
              <span className="products-table__col--status">
                <StatusPill
                  status={product.visible === false ? 'hidden' : 'published'}
                  label={product.visible === false ? t('db_hidden') : t('db_published')}
                />
              </span>
              <span className="products-table__col--actions">
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => handleEdit(product)}
                  type="button"
                >
                  {t('db_edit')}
                </button>
                <button
                  className="btn btn--ghost btn--sm btn--danger"
                  onClick={() => setDeleteConfirm(product)}
                  type="button"
                >
                  {t('db_delete')}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditProduct(null);
        }}
        product={editProduct}
      />

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={t('db_delete')}
      >
        <p>{t('confirm_delete')}</p>
        <div className="form-actions">
          <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)} type="button">
            {t('no')}
          </button>
          <button className="btn btn--danger" onClick={handleDelete} type="button">
            {t('yes')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
