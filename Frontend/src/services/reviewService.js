import apiClient from './api';

const reviewService = {
    // Create review with optional images
    async create(reviewData, images = []) {
        try {
            const formData = new FormData();

            // Append review data
            Object.keys(reviewData).forEach(key => {
                formData.append(key, reviewData[key]);
            });

            // Append images if provided
            if (images && images.length > 0) {
                images.forEach(image => {
                    formData.append('images', image);
                });
            }

            const response = await apiClient.post('/reviews', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
