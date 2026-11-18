import React, { useState, useEffect, useMemo } from 'react';
import { t, fill, onLangChange, getLang } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import EmptyState from '../../components/ui/EmptyState';
import { I } from '../../components/ui/Icons';

function StarDistribution({ reviews }) {
  const dist = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 0)));
      counts[star - 1]++;
    });
    return counts;
  }, [reviews]);

  const total = reviews.length;

  return (
    <div className="rv-dist">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{t('rv_distribution')}</h3>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = dist[star - 1];
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="rv-bar-row">
            <span className="rv-bar-label">{fill(t('rv_stars'), { n: star })}</span>
            <div className="rv-bar">
              <div className="rv-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="rv-bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ProductBreakdown({ reviews, products }) {
  const breakdown = useMemo(() => {
    const map = {};
    reviews.forEach((r) => {
      if (!r.productId) return;
      if (!map[r.productId]) map[r.productId] = { sum: 0, count: 0 };
      map[r.productId].sum += r.rating || 0;
      map[r.productId].count++;
    });
    return Object.entries(map)
      .map(([pid, { sum, count }]) => {
        const product = products.find((p) => String(p.id) === String(pid));
        return {
          productId: pid,
          name: product?.name || `#${pid}`,
          avg: (sum / count).toFixed(1),
          count,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [reviews, products]);

  if (breakdown.length === 0) return null;

  return (
    <div className="rv-products">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{t('rv_by_product')}</h3>
      {breakdown.map((item) => (
        <div key={item.productId} className="rv-prod-row">
          <span className="rv-prod-name">{item.name}</span>
          <span className="rv-prod-stars">
            {'★'.repeat(Math.round(Number(item.avg)))}{'☆'.repeat(5 - Math.round(Number(item.avg)))}
            {' '}{item.avg}
          </span>
          <span className="rv-prod-count">({item.count})</span>
        </div>
      ))}
    </div>
  );
}

export default function ReviewsView() {
  const [, setTick] = useState(0);
  const shop = useShopStore((s) => s.shop);
  const reviews = useShopStore((s) => s.reviews);
  const products = useShopStore((s) => s.products);
  const fetchReviews = useShopStore((s) => s.fetchReviews);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (shop?.id) fetchReviews();
  }, [shop?.id, fetchReviews]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '—';

  return (
    <div className="reviews-view">
      <h1>{t('db_reviews')}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon">{I.spark({ width: 20, height: 20 })}</div>
          <div className="stat-card__value">{avgRating}</div>
          <div className="stat-card__label">{t('rv_avg_rating')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">{I.chat({ width: 20, height: 20 })}</div>
          <div className="stat-card__value">{reviews.length}</div>
          <div className="stat-card__label">{t('db_reviews')}</div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState icon="&#11088;" title={t('rv_empty_t')} description={t('rv_empty_d')} />
      ) : (
        <>
          <StarDistribution reviews={reviews} />
          <ProductBreakdown reviews={reviews} products={products || []} />

          <div className="reviews-list" style={{ marginTop: 24 }}>
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-card__header">
                  <div className="review-card__stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`review-card__star ${star <= (review.rating || 0) ? 'review-card__star--filled' : ''}`}
                      >
                        &#9733;
                      </span>
                    ))}
                  </div>
                  <span className="review-card__date">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString(getLang() === 'ru' ? 'ru-RU' : getLang() === 'uz' ? 'uz-UZ' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                  </span>
                </div>
                <p className="review-card__text">{review.text}</p>
                <span className="review-card__author">
                  {review.customerName || review.customerPhone || t('rv_anon')}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
