const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Product extends BaseModel {
    constructor() {
        super('products', ['name', 'description', 'price', 'stock', 'images', 'category_id', 'sort_order']);
    }

    async create(data) {
        const { store_id, name, description, price, stock, category_id, images } = data;
        const query = `
      INSERT INTO products (store_id, name, description, price, stock, category_id, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [store_id, name, description, price, stock, category_id, JSON.stringify(images || [])];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    async findByStore(store_id, limit = 20, offset = 0) {
        const query = `SELECT * FROM products WHERE store_id = $1 ORDER BY sort_order ASC, created_at DESC LIMIT $2 OFFSET $3`;
        const { rows } = await db.query(query, [store_id, limit, offset]);
        return rows;
    }

    async reorder(productIds) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            for (let i = 0; i < productIds.length; i++) {
                await client.query(`UPDATE products SET sort_order = $1 WHERE id = $2`, [i, productIds[i]]);
            }
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new Product();
