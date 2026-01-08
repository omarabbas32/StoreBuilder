const ProductService = require('../services/product.service');
const StoreService = require('../services/store.service');

class ProductController {
    async create(req, res) {
        try {
            const { store_id } = req.body;
            const ownerId = req.user?.id;

            // Verify store ownership
            const store = await StoreService.getStoreById(store_id);
            if (!store || store.owner_id !== ownerId) {
                return res.status(403).json({ error: 'Forbidden: You do not own this store' });
            }

            const product = await ProductService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const { limit, offset, store_id } = req.query;
            let products;
            if (store_id) {
                products = await ProductService.getProductsByStore(store_id, limit, offset);
            } else {
                products = await ProductService.getAllProducts(limit, offset);
            }
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async reorder(req, res) {
        try {
            const { productIds } = req.body;
            await ProductService.reorderProducts(productIds);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const productId = req.params.id;
            const ownerId = req.user?.id;

            const product = await ProductService.getProductById(productId);
            if (!product) return res.status(404).json({ error: 'Product not found' });

            const store = await StoreService.getStoreById(product.store_id);
            if (!store || store.owner_id !== ownerId) {
                return res.status(403).json({ error: 'Forbidden: You do not own this store' });
            }

            const updatedProduct = await ProductService.updateProduct(productId, req.body);
            res.json(updatedProduct);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const productId = req.params.id;
            const ownerId = req.user?.id;

            const product = await ProductService.getProductById(productId);
            if (!product) return res.status(404).json({ error: 'Product not found' });

            const store = await StoreService.getStoreById(product.store_id);
            if (!store || store.owner_id !== ownerId) {
                return res.status(403).json({ error: 'Forbidden: You do not own this store' });
            }

            await ProductService.deleteProduct(productId);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new ProductController();
