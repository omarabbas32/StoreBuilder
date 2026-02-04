import apiClient from './api';

const reviewService = {
    // Create review
    async create(reviewData) {
        try {
            const response = await apiClient.post('/reviews', reviewData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create review',
            };
        }
    },

    // Get all reviews for a product
    async getProductReviews(productId) {
        try {
            const response = await apiClient.get(`/reviews/product/${productId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch reviews',
            };
        }
    },

    // Mark review as helpful
    async markHelpful(reviewId) {
        try {
            const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to mark review as helpful',
            };
        }
    },
};

export default reviewService;
