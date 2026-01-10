import apiClient from './api';

const productService = {
    async getProducts(storeId) {
        return await apiClient.get(`/products?store_id=${storeId}`);
    },

    async getProductById(id) {
        return await apiClient.get(`/products/${id}`);
    },

    async createProduct(productData) {
        return await apiClient.post('/products', productData);
    },

    async updateProduct(id, productData) {
        return await apiClient.put(`/products/${id}`, productData);
    },

    async deleteProduct(id) {
        return await apiClient.delete(`/products/${id}`);
    },

    async reorderProducts(productIds) {
        return await apiClient.post('/products/reorder', { productIds });
    },
};

export default productService;
