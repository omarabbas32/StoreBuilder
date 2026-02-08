import api from './api';

const webhookService = {
    /**
     * Create a new webhook subscription
     */
    create: async (data) => {
        const response = await api.post('/webhooks', data);
        return response.data;
    },

    /**
     * Get all webhook subscriptions
     */
    getAll: async () => {
        const response = await api.get('/webhooks');
        return response.data;
    },

    /**
     * Get a specific webhook subscription
     */
    getOne: async (id) => {
        const response = await api.get(`/webhooks/${id}`);
        return response.data;
    },

    /**
     * Update a webhook subscription
     */
    update: async (id, data) => {
        const response = await api.put(`/webhooks/${id}`, data);
        return response.data;
    },

    /**
     * Delete a webhook subscription
     */
    delete: async (id) => {
        const response = await api.delete(`/webhooks/${id}`);
        return response.data;
    },

    /**
     * Regenerate webhook secret
     */
    regenerateSecret: async (id) => {
        const response = await api.post(`/webhooks/${id}/regenerate-secret`);
        return response.data;
    },

    /**
     * Send a test webhook
     */
    sendTest: async (id) => {
        const response = await api.post(`/webhooks/${id}/test`);
        return response.data;
    },

    /**
     * Get webhook delivery logs
     */
    getLogs: async (id, limit = 50) => {
        const response = await api.get(`/webhooks/${id}/logs`, {
            params: { limit }
        });
        return response.data;
    }
};

export default webhookService;
