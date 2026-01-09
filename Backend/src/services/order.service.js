const Order = require('../models/Order');
const db = require('../config/database');

class OrderService {
    async createOrder(orderData, items, cartId = null) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create the order
            const orderQuery = `
                INSERT INTO orders (
                    store_id, customer_id, total_amount, status, 
                    customer_name, customer_email, customer_phone, 
                    shipping_address, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const orderValues = [
                orderData.store_id,
                orderData.customer_id || null,
                orderData.total_amount,
                'pending',
                orderData.customer_name,
                orderData.customer_email,
                orderData.customer_phone,
                orderData.shipping_address,
                orderData.notes
            ];
            const { rows: [order] } = await client.query(orderQuery, orderValues);

            // 2. Create order items
            for (const item of items) {
                const itemQuery = `
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                    VALUES ($1, $2, $3, $4)
                `;
                await client.query(itemQuery, [order.id, item.product_id || item.id, item.quantity, item.price]);

                // 3. Update product stock (decrement)
                const stockQuery = `
                    UPDATE products 
                    SET stock = stock - $1 
                    WHERE id = $2
                `;
                await client.query(stockQuery, [item.quantity, item.product_id || item.id]);
            }

            // 4. Clear the cart if cartId is provided
            if (cartId) {
                await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
            }

            await client.query('COMMIT');
            return order;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getStoreOrders(storeId) {
        const query = `
            SELECT o.*, 
            (SELECT json_agg(oi.*) FROM order_items oi WHERE oi.order_id = o.id) as items
            FROM orders o
            WHERE o.store_id = $1
            ORDER BY o.created_at DESC
        `;
        const { rows } = await db.query(query, [storeId]);
        return rows;
    }

    async getCustomerOrders(customerId, storeId = null) {
        let query;
        let params;

        if (storeId) {
            query = `
                SELECT o.*, 
                (SELECT json_agg(oi.*) FROM order_items oi WHERE oi.order_id = o.id) as items
                FROM orders o
                WHERE o.customer_id = $1 AND o.store_id = $2
                ORDER BY o.created_at DESC
            `;
            params = [customerId, storeId];
        } else {
            query = `
                SELECT o.*, 
                (SELECT json_agg(oi.*) FROM order_items oi WHERE oi.order_id = o.id) as items
                FROM orders o
                WHERE o.customer_id = $1
                ORDER BY o.created_at DESC
            `;
            params = [customerId];
        }

        const { rows } = await db.query(query, params);
        return rows;
    }
}

module.exports = new OrderService();
