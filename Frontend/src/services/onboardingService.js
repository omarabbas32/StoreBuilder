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
};

export default onboardingService;

