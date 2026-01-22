import apiClient from './api';

const normalizeStore = (store) => {
    if (!store || typeof store !== 'object') return store;
    if (typeof store.settings === 'string') {
        try {
            return { ...store, settings: JSON.parse(store.settings) };
        } catch (e) {
            return store;
        }
    }
    return store;
};

const onboardingService = {
    async submitOnboardingAnswers(storeId, answers) {
        const response = await apiClient.post(`/stores/${storeId}/onboarding`, answers);
        if (!response.success) {
            return response;
        }
        return { ...response, data: normalizeStore(response.data) };
    },

    async uploadLogo(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await apiClient.post('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to upload logo',
            };
        }
    },

    /**
     * Get the onboarding question schema for AI agents
     */
    async getSchema() {
        try {
            const response = await apiClient.get('/onboarding/schema');
            return response;
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch schema',
            };
        }
    },

    /**
     * Create a store via AI agent with structured answers
     */
    async aiCreateStore(answers) {
        try {
            const response = await apiClient.post('/onboarding/ai-create', { answers });
            if (!response.success) {
                return response;
            }
            return { ...response, data: normalizeStore(response.data) };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create store via AI',
            };
        }
    },

    /**
     * Send chat messages to AI agent
     */
    async aiChat(messages) {
        try {
            const response = await apiClient.post('/onboarding/ai-chat', { messages });
            return response;
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to chat with AI',
            };
        }
    },
};

export default onboardingService;
