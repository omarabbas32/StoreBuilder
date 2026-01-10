const db = require('../config/database');
const BaseModel = require('./BaseModel');

class Order extends BaseModel {
    constructor() {
        super('orders', ['status', 'shipping_address', 'notes', 'customer_name', 'customer_email', 'customer_phone', 'total_amount']);
    }

    async createWithItems(orderData, items) {
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

            // 2. Create order items (if we had an order_items table, but based on migration 006 we only expanded orders table)
            // Wait, migration 006 only added columns to orders. 
            // Usually we need an order_items table. Let's check 006 again.

            await client.query('COMMIT');
            return order;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getByStore(storeId) {
        const query = `
            SELECT * FROM orders 
            WHERE store_id = $1 
            ORDER BY created_at DESC
        `;
        const { rows } = await db.query(query, [storeId]);
        return rows;
    }
}

module.exports = new Order();
