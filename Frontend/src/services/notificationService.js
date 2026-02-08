import api from './api';

const notificationService = {
    getNotifications: async (storeId) => {
        const response = await api.get(`/notifications?storeId=${storeId}`);
        return response.data;
    },

    markAsRead: async (id, storeId) => {
        const response = await api.put(`/notifications/${id}/read`, { storeId });
        return response.data;
    },

    markAllAsRead: async (storeId) => {
        const response = await api.put('/notifications/mark-all-read', { storeId });
        return response.data;
    },

    deleteNotification: async (id, storeId) => {
        const response = await api.delete(`/notifications/${id}?storeId=${storeId}`);
        return response.data;
    }
};

export default notificationService;
