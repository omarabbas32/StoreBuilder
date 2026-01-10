const Cart = require('../models/Cart');
const db = require('../config/database');

class CartService {
    async getOrCreateCart(sessionId, customerId = null, storeId = null) {
        if (!storeId) throw new Error('storeId is required for cart operations');

        let query;
        let values;

        if (customerId) {
            query = `
                INSERT INTO carts (customer_id, store_id)
                VALUES ($1, $2)
                ON CONFLICT (customer_id, store_id) 
                DO UPDATE SET updated_at = NOW()
                RETURNING *
            `;
            values = [customerId, storeId];
        } else {
            query = `
                INSERT INTO carts (session_id, store_id)
                VALUES ($1, $2)
                ON CONFLICT (session_id, store_id) 
                DO UPDATE SET updated_at = NOW()
                RETURNING *
            `;
            values = [sessionId, storeId];
        }

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    async getCartWithItems(cartId) {
        const cart = await Cart.findById(cartId);
        if (!cart) return null;

        const items = await Cart.getCartItems(cartId);

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        return {
            ...cart,
            items,
            subtotal,
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    async addToCart(cartId, productId, quantity = 1) {
        return await Cart.addItem(cartId, productId, quantity);
    }

    async updateQuantity(cartId, productId, quantity) {
        if (quantity <= 0) {
            return await Cart.removeItem(cartId, productId);
        }
        return await Cart.updateItemQuantity(cartId, productId, quantity);
    }

    async removeFromCart(cartId, productId) {
        return await Cart.removeItem(cartId, productId);
    }

    async clearCart(cartId) {
        return await Cart.clearCart(cartId);
    }
}

module.exports = new CartService();
