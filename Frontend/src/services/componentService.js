import apiClient from './api';

const componentService = {
    // Get active components (public)
    async getActive() {
        try {
            const response = await apiClient.get('/components');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch components',
            };
        }
    },

    // Get all components (admin only)
    async adminGetAll() {
        try {
            const response = await apiClient.get('/components/admin');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch components',
            };
        }
    },

    // Create new component (admin only)
    async create(componentData) {
        try {
            const response = await apiClient.post('/components/admin', componentData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create component',
            };
        }
    },
};

export default componentService;
