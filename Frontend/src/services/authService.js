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

    // Customer login (same endpoint, customers use /auth/login with role=customer)
    async loginCustomer(email, password) {
        return await apiClient.post('/auth/login', { email, password });
    },

    // Customer register
    async registerCustomer(userData) {
        return await apiClient.post('/auth/register', { ...userData, role: 'customer' });
    },

    // Google OAuth - Get auth URL for customer
    async getGoogleAuthUrlCustomer() {
        return await apiClient.get('/auth/google/url/customer');
    },

    // Google OAuth - Get auth URL for owner
    async getGoogleAuthUrlOwner() {
        return await apiClient.get('/auth/google/url/owner');
    },

    // Google OAuth - Handle callback (this happens server-side)
    async handleGoogleCallback() {
        // Backend handles this, frontend doesn't need to call it
        // It happens when user is redirected back from Google
    },
};

export default authService;
