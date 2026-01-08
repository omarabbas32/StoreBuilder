const CartService = require('../services/cart.service');

class CartController {
    async getCart(req, res) {
        try {
            const sessionId = req.headers['x-session-id'];
            const storeId = req.headers['x-store-id'];
            const customerId = req.user?.id;

            if (!storeId) return res.status(400).json({ error: 'Store ID is required' });

            const cart = await CartService.getOrCreateCart(sessionId, customerId, storeId);
            const cartWithItems = await CartService.getCartWithItems(cart.id);

            res.json(cartWithItems);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addItem(req, res) {
        try {
            const { productId, quantity = 1 } = req.body;
            const sessionId = req.headers['x-session-id'];
            const storeId = req.headers['x-store-id'];
            const customerId = req.user?.id;

            if (!storeId) return res.status(400).json({ error: 'Store ID is required' });

            const cart = await CartService.getOrCreateCart(sessionId, customerId, storeId);
            await CartService.addToCart(cart.id, productId, quantity);

            const updatedCart = await CartService.getCartWithItems(cart.id);
            res.json(updatedCart);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateItem(req, res) {
        try {
            const { productId, quantity } = req.body;
            const sessionId = req.headers['x-session-id'];
            const storeId = req.headers['x-store-id'];
            const customerId = req.user?.id;

            if (!storeId) return res.status(400).json({ error: 'Store ID is required' });

            const cart = await CartService.getOrCreateCart(sessionId, customerId, storeId);
            await CartService.updateQuantity(cart.id, productId, quantity);

            const updatedCart = await CartService.getCartWithItems(cart.id);
            res.json(updatedCart);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async removeItem(req, res) {
        try {
            const { productId } = req.params;
            const sessionId = req.headers['x-session-id'];
            const storeId = req.headers['x-store-id'];
            const customerId = req.user?.id;

            if (!storeId) return res.status(400).json({ error: 'Store ID is required' });

            const cart = await CartService.getOrCreateCart(sessionId, customerId, storeId);
            await CartService.removeFromCart(cart.id, productId);

            const updatedCart = await CartService.getCartWithItems(cart.id);
            res.json(updatedCart);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async clearCart(req, res) {
        try {
            const sessionId = req.headers['x-session-id'];
            const storeId = req.headers['x-store-id'];
            const customerId = req.user?.id;

            if (!storeId) return res.status(400).json({ error: 'Store ID is required' });

            const cart = await CartService.getOrCreateCart(sessionId, customerId, storeId);
            await CartService.clearCart(cart.id);

            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new CartController();
