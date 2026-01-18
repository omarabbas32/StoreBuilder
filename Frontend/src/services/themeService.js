import apiClient from './api';

const themeService = {
    // Get all active themes (public)
    async getAll() {
        const response = await apiClient.get('/themes');
        if (!response.success) {
            return response;
        }
        return response;
    },

    // Get all themes including inactive (admin only)
    async adminGetAll() {
        const response = await apiClient.get('/themes/admin');
        if (!response.success) {
            return response;
        }
        return response;
    },

    // Create new theme (admin only)
    async create(themeData) {
        const response = await apiClient.post('/themes/admin', themeData);
        if (!response.success) {
            return response;
        }
        return response;
    },

    // Save current design as template (user)
    async saveAsTemplate(templateData) {
        const response = await apiClient.post('/themes', templateData);
        if (!response.success) {
            return response;
        }
        return response;
    },
};

export default themeService;
