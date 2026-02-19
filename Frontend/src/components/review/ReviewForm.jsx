import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStorePath } from '../../hooks/useStorePath';
import useAuthStore from '../../store/authStore';
import reviewService from '../../services/reviewService';
import StarRating from '../ui/StarRating';
import Input from '../ui/Input';
import Button from '../ui/Button';
import './ReviewForm.css';

const ReviewForm = ({ productId, productName, onReviewSubmitted, onCancel }) => {
    const { isAuthenticated } = useAuthStore();
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [eligibility, setEligibility] = useState({ eligible: true, reason: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isAuthenticated && productId) {
            checkUserEligibility();
        } else {
            setCheckingEligibility(false);
        }
    }, [isAuthenticated, productId]);

    const checkUserEligibility = async () => {
        setCheckingEligibility(true);
        const result = await reviewService.checkEligibility(productId);
        if (result.success) {
            setEligibility({
                eligible: result.data.eligible,
                reason: result.data.reason
            });
        }
        setCheckingEligibility(false);
    };

    if (checkingEligibility) {
        return <div className="review-loading">Verifying eligibility...</div>;
    }

    if (success) {
        return (
            <div className="review-success-modal">
                <div className="success-icon">✅</div>
                <h3>Thank you!</h3>
                <p>Your review for <strong>{productName}</strong> has been submitted.</p>
                <Button onClick={onCancel || (() => window.location.reload())}>
                    Close
                </Button>
            </div>
        );
    }

    // Gate 2: must be eligible (purchased + not reviewed yet)
    if (!eligibility.eligible) {
        return (
            <div className="review-not-eligible">
                <p>🚫 {eligibility.reason}</p>
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} style={{ marginTop: '1rem' }}>
                        Close
                    </Button>
                )}
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await reviewService.create({
            product_id: productId,
            rating,
            title,
            comment,
        });

        if (result.success) {
            setSuccess(true);
            if (onReviewSubmitted) onReviewSubmitted(result.data);
        } else {
            setError(result.error || 'Failed to submit review');
        }
        setLoading(false);
    };

    return (
        <form className="review-form modal-context" onSubmit={handleSubmit}>
            <div className="form-header">
                <h3>Review {productName}</h3>
                {onCancel && (
                    <button type="button" className="close-btn" onClick={onCancel} aria-label="Close">
                        &times;
                    </button>
                )}
            </div>

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

            <div className="form-actions">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </form>
    );
};

export default ReviewForm;
