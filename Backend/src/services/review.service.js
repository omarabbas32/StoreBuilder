const Review = require('../models/Review');

class ReviewService {
    async createReview(data) {
        // Basic validation or additional logic can go here
        // e.g. checking if user already reviewed logic, though DB constraints can also handle that
        return await Review.create(data);
    }

    async getProductReviews(productId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const reviews = await Review.findByProductId(productId, limit, offset);
        const total = await Review.countByProductId(productId);

        return {
            reviews,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getReviewById(id) {
        return await Review.findById(id);
    }

    async updateReviewStatus(id, status) {
        return await Review.updateStatus(id, status);
    }

    async deleteReview(id) {
        return await Review.delete(id);
    }

    async markHelpful(reviewId, customerId) {
        return await Review.addHelpfulVote(reviewId, customerId);
    }
}

module.exports = new ReviewService();
