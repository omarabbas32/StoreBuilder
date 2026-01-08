import apiClient from './api';

const customerService = {
    // Create customer profile
    async create(customerData) {
        try {
            const response = await apiClient.post('/customers', customerData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create customer profile',
            };
        }
    },

    // Get customer by ID
    async getById(id) {
        try {
            const response = await apiClient.get(`/customers/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch customer',
            };
        }
    },
};

export default customerService;
