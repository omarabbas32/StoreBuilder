import apiClient from './api';

const adminService = {
    // Theme Management
    async getAllThemes() {
        try {
            const response = await apiClient.get('/admin/themes');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch themes',
            };
        }
    },

    async createTheme(themeData) {
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

    // Component Management
    async getAllComponents() {
        try {
            const response = await apiClient.get('/admin/components');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch components',
            };
        }
    },

    async createComponent(componentData) {
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

    // Store Management
    async getAllStores() {
        try {
            const response = await apiClient.get('/admin/stores');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch stores',
            };
        }
    },

    // Dashboard Stats
    async getDashboardStats() {
        try {
            const response = await apiClient.get('/admin/dashboard');
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch stats',
            };
        }
    },
};

export default adminService;
