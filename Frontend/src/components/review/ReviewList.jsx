import { ThumbsUp } from 'lucide-react';
import StarRating from '../ui/StarRating';
import Card from '../ui/Card';
import reviewService from '../../services/reviewService';
import './ReviewList.css';

const ReviewList = ({ reviews, onHelpfulVote }) => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
        return (
            <div className="review-list-empty">
                <p>No reviews yet. Be the first to share your thoughts!</p>
            </div>
        );
    }

    const validReviews = reviews.filter(r => r && typeof r.rating === 'number');
    const averageRating = validReviews.length > 0
        ? validReviews.reduce((acc, r) => acc + r.rating, 0) / validReviews.length
        : 0;

    const handleHelpful = async (reviewId) => {
        const result = await reviewService.markHelpful(reviewId);
        if (result.success && onHelpfulVote) {
            onHelpfulVote(reviewId);
        }
    };

    return (
        <div className="review-list">
            <div className="review-summary">
                <div className="average-box">
                    <span className="average-number">{averageRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(averageRating)} readonly size={24} />
                    <span className="total-reviews">Based on {reviews.length} reviews</span>
                </div>
            </div>

            <div className="reviews-container">
                {reviews.map((review) => (
                    <Card key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="user-info">
                                <span className="user-name">{review.user_name || 'Anonymous'}</span>
                                <span className="review-date">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <StarRating rating={review.rating} readonly size={16} />
                        </div>
                        <h4 className="review-title">{review.title}</h4>
                        <p className="review-comment">{review.comment}</p>
                        <div className="review-footer">
                            <button
                                className="helpful-button"
                                onClick={() => handleHelpful(review.id)}
                            >
                                <ThumbsUp size={14} />
                                Helpful ({review.helpful_count || 0})
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ReviewList;
