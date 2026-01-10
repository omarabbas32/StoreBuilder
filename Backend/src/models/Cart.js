const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Cart extends BaseModel {
    constructor() {
        super('carts', ['customer_id', 'session_id', 'store_id']);
    }

    async findBySessionId(sessionId, storeId) {
        const query = `SELECT * FROM carts WHERE session_id = $1 AND store_id = $2`;
        const { rows } = await db.query(query, [sessionId, storeId]);
        return rows[0];
    }

    async findByCustomerId(customerId, storeId) {
        const query = `SELECT * FROM carts WHERE customer_id = $1 AND store_id = $2`;
        const { rows } = await db.query(query, [customerId, storeId]);
        return rows[0];
    }

    async getCartItems(cartId) {
        const query = `
            SELECT ci.*, p.name, p.price, p.images, p.stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1
        `;
        const { rows } = await db.query(query, [cartId]);
        return rows;
    }

    async addItem(cartId, productId, quantity) {
        // Check if item already exists
        const checkQuery = `SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2`;
        const { rows: existing } = await db.query(checkQuery, [cartId, productId]);

        if (existing.length > 0) {
            // Update quantity
            const updateQuery = `
                UPDATE cart_items 
                SET quantity = quantity + $1, updated_at = NOW()
                WHERE cart_id = $2 AND product_id = $3
                RETURNING *
            `;
            const { rows } = await db.query(updateQuery, [quantity, cartId, productId]);
            return rows[0];
        } else {
            // Insert new item
            const insertQuery = `
                INSERT INTO cart_items (cart_id, product_id, quantity)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const { rows } = await db.query(insertQuery, [cartId, productId, quantity]);
            return rows[0];
        }
    }

    async updateItemQuantity(cartId, productId, quantity) {
        const query = `
            UPDATE cart_items 
            SET quantity = $1, updated_at = NOW()
            WHERE cart_id = $2 AND product_id = $3
            RETURNING *
        `;
        const { rows } = await db.query(query, [quantity, cartId, productId]);
        return rows[0];
    }

    async removeItem(cartId, productId) {
        const query = `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`;
        await db.query(query, [cartId, productId]);
    }

    async clearCart(cartId) {
        const query = `DELETE FROM cart_items WHERE cart_id = $1`;
        await db.query(query, [cartId]);
    }
}

module.exports = new Cart();
