import apiClient from './api';

const categoryService = {
    // Create new category (admin only)
    async create(categoryData) {
        try {
            const response = await apiClient.post('/categories', categoryData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create category',
            };
        }
    },

    // Get all categories
    async getAll() {
        try {
            const response = await apiClient.get('/categories');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch categories',
            };
        }
    },

    // Get category by ID
    async getById(id) {
        try {
            const response = await apiClient.get(`/categories/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch category',
            };
        }
    },
};

export default categoryService;
