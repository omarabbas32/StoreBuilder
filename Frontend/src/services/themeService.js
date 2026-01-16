import apiClient from './api';

const themeService = {
    // Get all active themes (public)
    async getAll() {
        try {
            const response = await apiClient.get('/themes');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch themes',
            };
        }
    },

    // Get all themes including inactive (admin only)
    async adminGetAll() {
        try {
            const response = await apiClient.get('/themes/admin');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch themes',
            };
        }
    },

    // Create new theme (admin only)
    async create(themeData) {
        try {
            const response = await apiClient.post('/themes/admin', themeData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create theme',
            };
        }
    },

    // Save current design as template (user)
    async saveAsTemplate(templateData) {
        try {
            const response = await apiClient.post('/themes', templateData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to save template',
            };
        }
    },
};

export default themeService;
