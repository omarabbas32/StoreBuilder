import { Star } from 'lucide-react';
import './StarRating.css';

const StarRating = ({ rating, maxRating = 5, onRatingChange, readonly = false, size = 20 }) => {
    const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

    return (
        <div className={`star-rating ${readonly ? 'readonly' : ''}`}>
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`star-button ${star <= rating ? 'filled' : ''}`}
                    onClick={() => !readonly && onRatingChange && onRatingChange(star)}
                    disabled={readonly}
                >
                    <Star
                        size={size}
                        fill={star <= rating ? 'var(--color-warning)' : 'transparent'}
                        color={star <= rating ? 'var(--color-warning)' : 'var(--color-border)'}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
