import apiClient from './api';

const orderService = {
    async createOrder(orderData, items) {
        try {
            const response = await apiClient.post('/orders', { orderData, items });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to place order',
            };
        }
    },

    async getStoreOrders(storeId) {
        try {
            const response = await apiClient.get(`/orders/store/${storeId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch orders',
            };
        }
    }
};

export default orderService;
