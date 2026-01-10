import apiClient from './api';

const orderService = {
    async createOrder(orderData, items, cartId = null) {
        return await apiClient.post('/orders', { orderData, items, cartId });
    },

    async getStoreOrders(storeId) {
        return await apiClient.get(`/orders/store/${storeId}`);
    },

    async getMyOrders(storeId = null) {
        const config = storeId ? { headers: { 'x-store-id': storeId } } : {};
        return await apiClient.get('/orders/my-orders', config);
    }
};

export default orderService;
