import { useState } from 'react';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import Input from '../ui/Input';
import reviewService from '../../services/reviewService';
import './ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const reviewData = {
            productId: productId,
            rating,
            title,
            comment,
        };

        const result = await reviewService.create(reviewData);

        if (result.success) {
            setTitle('');
            setComment('');
            setRating(5);
            if (onReviewSubmitted) onReviewSubmitted(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3>Write a Review</h3>

            <div className="form-group">
                <label>Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <Input
                label="Review Title"
                placeholder="Summarize your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
            />

            <div className="form-group">
                <label>Your Comment</label>
                <textarea
                    className="form-textarea"
                    placeholder="Tell others what you think about this product"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                ></textarea>
            </div>

            {error && <p className="error-message">{error}</p>}

            <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
        </form>
    );
};

export default ReviewForm;
