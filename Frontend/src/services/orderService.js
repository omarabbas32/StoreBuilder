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

    async getStoreOrders(storeId, page = 1, limit = 20, filters = {}) {
        const { status, startDate, endDate } = filters;
        let queryParams = new URLSearchParams({ page, limit });
        if (status && status !== 'all') queryParams.append('status', status);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        return await apiClient.get(`/orders/store/${storeId}?${queryParams.toString()}`);
    },

    async getMyOrders(storeId = null, page = 1, limit = 20) {
        const config = storeId ? { headers: { 'x-store-id': storeId } } : {};
        const query = `page=${page}&limit=${limit}`;
        return await apiClient.get(`/orders/my-orders?${query}`, config);
    },

    async updateOrderStatus(orderId, status) {
        return await apiClient.patch(`/orders/${orderId}/status`, { status });
    },

    async getOrder(orderId) {
        return await apiClient.get(`/orders/${orderId}`);
    }
};

export default orderService;
