import apiClient from './api';

const orderService = {
    async createOrder(orderData, items, cartId = null) {
        try {
            const response = await apiClient.post('/orders', { orderData, items, cartId });
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
    },

    async getMyOrders(storeId = null) {
        try {
            const config = storeId ? { headers: { 'x-store-id': storeId } } : {};
            const response = await apiClient.get('/orders/my-orders', config);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch your orders',
            };
        }
    }
};

export default orderService;
