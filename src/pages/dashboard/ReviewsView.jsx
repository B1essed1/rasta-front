import React, { useState, useEffect } from 'react';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import EmptyState from '../../components/ui/EmptyState';

export default function ReviewsView() {
  const [, setTick] = useState(0);
  const shop = useShopStore((s) => s.shop);
  const reviews = useShopStore((s) => s.reviews);
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
          <div className="stat-card__icon">&#11088;</div>
          <div className="stat-card__value">{avgRating}</div>
          <div className="stat-card__label">Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">&#128172;</div>
          <div className="stat-card__value">{reviews.length}</div>
          <div className="stat-card__label">{t('db_reviews')}</div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState icon="&#11088;" title={t('sf_empty')} />
      ) : (
        <div className="reviews-list">
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
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
              <p className="review-card__text">{review.text}</p>
              <span className="review-card__author">
                {review.customerName || review.customerPhone || 'Anonymous'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
