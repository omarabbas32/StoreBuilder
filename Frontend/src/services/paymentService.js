import apiClient from './api';

const paymentService = {
    // Process payment
    async process(paymentData) {
        try {
            const response = await apiClient.post('/payments/process', paymentData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Payment processing failed',
            };
        }
    },
};

export default paymentService;
