import { useState } from 'react';
import { ThumbsUp, CheckCircle } from 'lucide-react';
import StarRating from '../ui/StarRating';
import Card from '../ui/Card';
import reviewService from '../../services/reviewService';
import './ReviewList.css';

const ReviewList = ({ reviews, onHelpfulVote }) => {
    const [votingIds, setVotingIds] = useState(new Set());

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
        if (votingIds.has(reviewId)) return;

        setVotingIds(prev => new Set(prev).add(reviewId));
        try {
            const result = await reviewService.markHelpful(reviewId);
            if (result.success && onHelpfulVote) {
                onHelpfulVote(reviewId);
            }
        } catch (err) {
            console.error('Failed to mark review as helpful:', err);
        } finally {
            setVotingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(reviewId);
                return newSet;
            });
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
                {reviews.map((review, index) => {
                    if (!review || typeof review !== 'object') {
                        return null;
                    }

                    const reviewId = review.id || `temp-${index}`;

                    return (
                        <Card key={reviewId} className="review-card">
                            <div className="review-header">
                                <div className="user-info">
                                    <div className="name-wrapper">
                                        <span className="user-name">{review.user_name || review.userName || 'Anonymous'}</span>
                                        {review.is_verified_purchase && (
                                            <span className="verified-badge" title="Verified Purchase">
                                                <CheckCircle size={12} className="verified-icon" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <span className="review-date">
                                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recently'}
                                    </span>
                                </div>
                                <StarRating rating={review.rating || 5} readonly size={16} />
                            </div>
                            <h4 className="review-title">{review.title || 'Review'}</h4>
                            <p className="review-comment">{review.comment || ''}</p>
                            <div className="review-footer">
                                <button
                                    className={`helpful-button ${votingIds.has(reviewId) ? 'loading' : ''}`}
                                    onClick={() => handleHelpful(reviewId)}
                                    disabled={votingIds.has(reviewId)}
                                >
                                    <ThumbsUp size={14} />
                                    {votingIds.has(reviewId) ? 'Voting...' : `Helpful (${review.helpful_count || 0})`}
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
