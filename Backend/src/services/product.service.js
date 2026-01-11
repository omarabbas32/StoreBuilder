const Product = require('../models/Product');
const { NotFoundError } = require('../utils/errors');

class ProductService {
    async createProduct(data) {
        return await Product.create(data);
    }

    async getProductById(id) {
        const product = await Product.findById(id);
        if (!product) throw new NotFoundError('Product not found');
        return product;
    }

    async getAllProducts(limit, offset) {
        return await Product.findAll(limit, offset);
    }

    async getProductsByStore(storeId, limit, offset) {
        return await Product.findByStore(storeId, limit, offset);
    }

    async getProductsByCategory(categoryId, storeId = null, limit, offset) {
        return await Product.findByCategory(categoryId, storeId, limit, offset);
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
