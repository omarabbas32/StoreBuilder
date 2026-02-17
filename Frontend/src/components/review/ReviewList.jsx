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
                {reviews.map((review) => {
                    // Handle null or undefined reviews
                    if (!review || typeof review !== 'object') {
                        return null;
                    }

                    return (
                        <Card key={review.id || Math.random()} className="review-card">
                            <div className="review-header">
                                <div className="user-info">
                                    <span className="user-name">{review.user_name || review.userName || review.customerName || 'Anonymous'}</span>
                                    <span className="review-date">
                                        {review.created_at || review.createdAt ? new Date(review.created_at || review.createdAt).toLocaleDateString() : 'Recently'}
                                    </span>
                                </div>
                                <StarRating rating={review.rating || 5} readonly size={16} />
                            </div>
                            <h4 className="review-title">{review.title || 'Review'}</h4>
                            <p className="review-comment">{review.comment || ''}</p>
                            <div className="review-footer">
                                <button
                                    className="helpful-button"
                                    onClick={() => handleHelpful(review.id)}
                                >
                                    <ThumbsUp size={14} />
                                    Helpful ({review.helpful_count || review.helpfulCount || 0})
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewList;
