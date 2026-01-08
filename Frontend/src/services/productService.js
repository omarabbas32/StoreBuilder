import apiClient from './api';

const productService = {
    async getProducts(storeId) {
        try {
            const response = await apiClient.get(`/products?store_id=${storeId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch products',
            };
        }
    },

    async getProductById(id) {
        try {
            const response = await apiClient.get(`/products/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch product',
            };
        }
    },

    async createProduct(productData) {
        try {
            const response = await apiClient.post('/products', productData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create product',
            };
        }
    },

    async updateProduct(id, productData) {
        try {
            const response = await apiClient.put(`/products/${id}`, productData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update product',
            };
        }
    },

    async deleteProduct(id) {
        try {
            await apiClient.delete(`/products/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete product',
            };
        }
    },

    async reorderProducts(productIds) {
        try {
            const response = await apiClient.post('/products/reorder', { productIds });
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to reorder products',
            };
        }
    },
};

export default productService;
