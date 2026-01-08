const Product = require('../models/Product');

class ProductService {
    async createProduct(data) {
        return await Product.create(data);
    }

    async getProductById(id) {
        return await Product.findById(id);
    }

    async getAllProducts(limit, offset) {
        return await Product.findAll(limit, offset);
    }

    async getProductsByStore(storeId, limit, offset) {
        return await Product.findByStore(storeId, limit, offset);
    }

    async deleteProduct(id) {
        return await Product.delete(id);
    }

    async reorderProducts(productIds) {
        return await Product.reorder(productIds);
    }

    async updateProduct(id, data) {
        return await Product.update(id, data);
    }
}

module.exports = new ProductService();
