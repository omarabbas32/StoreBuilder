import apiClient from './api';

const orderService = {
    async createOrder(orderData, items) {
        // Flatten the request to match back-end expectations
        const payload = {
            ...orderData,
            items: items.map(item => ({
                productId: item.productId || item.id || item._id,
                quantity: item.quantity
            }))
        };
        return await apiClient.post('/orders', payload);
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
