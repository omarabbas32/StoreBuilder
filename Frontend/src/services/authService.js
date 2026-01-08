import apiClient from './api';

const authService = {
    // Register new user
    async register(userData) {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed',
            };
        }
    },

    // Login user
    async login(email, password) {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed',
            };
        }
    },

    // Verify email
    async verifyEmail(token) {
        try {
            const response = await apiClient.get(`/auth/verify-email?token=${token}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Verification failed',
            };
        }
    },

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await apiClient.post('/auth/forgot-password', { email });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Request failed',
            };
        }
    },

    // Reset password
    async resetPassword(token, password) {
        try {
            const response = await apiClient.post('/auth/reset-password', {
                token,
                password,
            });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Reset failed',
            };
        }
    },

    // Logout
    async logout() {
        try {
            await apiClient.post('/auth/logout');
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },
};

export default authService;
