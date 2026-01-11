const ProductService = require('../services/product.service');
const StoreService = require('../services/store.service');
const response = require('../utils/response');

class ProductController {
    async create(req, res, next) {
        try {
            const { store_id } = req.body;
            const ownerId = req.user?.id;

            // Verify store ownership
            const store = await StoreService.getStoreById(store_id);
            if (!store || store.owner_id !== ownerId) {
                return response.error(res, 'Forbidden: You do not own this store', 403);
            }

            const product = await ProductService.createProduct(req.body);
            return response.success(res, product, 'Product created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            let { limit, offset, store_id, category_id } = req.query;

            // Multi-tenancy support: use tenant ID if store_id is not provided in query
            if (!store_id && req.tenant) {
                store_id = req.tenant;
            }

            let products;
            if (category_id) {
                // Filter by category (and optionally by store)
                products = await ProductService.getProductsByCategory(category_id, store_id, limit, offset);
            } else if (store_id) {
                products = await ProductService.getProductsByStore(store_id, limit, offset);
            } else {
                products = await ProductService.getAllProducts(limit, offset);
            }
            return response.success(res, products);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) return response.error(res, 'Product not found', 404);
            return response.success(res, product);
        } catch (error) {
            next(error);
        }
    }

    async reorder(req, res, next) {
        try {
            const { productIds } = req.body;
            await ProductService.reorderProducts(productIds);
            return response.success(res, null, 'Products reordered successfully');
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const productId = req.params.id;
            const ownerId = req.user?.id;

            const product = await ProductService.getProductById(productId);
            if (!product) return response.error(res, 'Product not found', 404);

            const store = await StoreService.getStoreById(product.store_id);
            if (!store || store.owner_id !== ownerId) {
                return response.error(res, 'Forbidden: You do not own this store', 403);
            }

            const updatedProduct = await ProductService.updateProduct(productId, req.body);
            return response.success(res, updatedProduct, 'Product updated successfully');
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const productId = req.params.id;
            const ownerId = req.user?.id;

            const product = await ProductService.getProductById(productId);
            if (!product) return response.error(res, 'Product not found', 404);

            const store = await StoreService.getStoreById(product.store_id);
            if (!store || store.owner_id !== ownerId) {
                return response.error(res, 'Forbidden: You do not own this store', 403);
            }

            await ProductService.deleteProduct(productId);
            return response.success(res, null, 'Product deleted successfully', 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
