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

    async getStoreOrders(storeId, page = 1, limit = 20) {
        return await apiClient.get(`/orders/store/${storeId}?page=${page}&limit=${limit}`);
    },

    async getMyOrders(storeId = null, page = 1, limit = 20) {
        const config = storeId ? { headers: { 'x-store-id': storeId } } : {};
        const query = `page=${page}&limit=${limit}`;
        return await apiClient.get(`/orders/my-orders?${query}`, config);
    }
};

export default orderService;
