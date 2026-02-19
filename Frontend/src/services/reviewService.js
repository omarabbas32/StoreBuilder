import apiClient from './api';

const reviewService = {
    // Create review
    async create(reviewData) {
        return await apiClient.post('/reviews', reviewData);
    },

    // Get all reviews for a product
    async getProductReviews(productId, params = {}) {
        return await apiClient.get(`/reviews/product/${productId}`, { params });
    },

    // Mark review as helpful
    async markHelpful(reviewId) {
        return await apiClient.post(`/reviews/${reviewId}/helpful`);
    },

    async checkEligibility(productId) {
        return await apiClient.get(`/reviews/eligibility/${productId}`);
    }
};

export default reviewService;
