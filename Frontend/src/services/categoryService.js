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

    // Get categories (can filter by store)
    async getAll(storeId = null) {
        try {
            const url = storeId ? `/categories/store/${storeId}` : '/categories';
            const response = await apiClient.get(url);
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
