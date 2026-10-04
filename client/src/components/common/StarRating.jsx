import React from 'react';

export const StarRating = ({ rating = 0, max = 5, onRate = null, size = '1.1rem', interactive = false }) => {
  const stars = [];

  for (let i = 1; i <= max; i++) {
    const isFilled = i <= Math.round(rating);
    stars.push(
      <span
        key={i}
        className={`star ${isFilled ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
        style={{ fontSize: size, cursor: interactive ? 'pointer' : 'default' }}
        onClick={() => interactive && onRate && onRate(i)}
        role={interactive ? 'button' : 'img'}
        aria-label={`${i} Star${i > 1 ? 's' : ''}`}
      >
        ★
      </span>
    );
  }

  return <div className="star-rating-container" style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>{stars}</div>;
};

export default StarRating;
