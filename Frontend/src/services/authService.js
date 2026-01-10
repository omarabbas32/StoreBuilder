import apiClient from './api';

const authService = {
    // Register new user
    async register(userData) {
        return await apiClient.post('/auth/register', userData);
    },

    // Login user
    async login(email, password) {
        return await apiClient.post('/auth/login', { email, password });
    },

    // Verify email
    async verifyEmail(token) {
        return await apiClient.get(`/auth/verify-email?token=${token}`);
    },

    // Forgot password
    async forgotPassword(email) {
        return await apiClient.post('/auth/forgot-password', { email });
    },

    // Reset password
    async resetPassword(token, password) {
        return await apiClient.post('/auth/reset-password', {
            token,
            password,
        });
    },

    // Logout
    async logout() {
        return await apiClient.post('/auth/logout');
    },
};

export default authService;
