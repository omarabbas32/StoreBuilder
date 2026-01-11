import apiClient from './api';

const onboardingService = {
    async submitOnboardingAnswers(storeId, answers) {
        try {
            const response = await apiClient.post(`/stores/${storeId}/onboarding`, answers);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to complete onboarding',
            };
        }
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

