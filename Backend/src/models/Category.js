const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Category extends BaseModel {
    constructor() {
        super('categories', ['name', 'description', 'store_id']);
    }

    async create(data) {
        const { name, slug, description, store_id, parent_id } = data;
        const query = `
      INSERT INTO categories (name, slug, description, store_id, parent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const { rows } = await db.query(query, [name, slug, description, store_id, parent_id]);
        return rows[0];
    }

    async findByStore(store_id) {
        const query = `SELECT * FROM categories WHERE store_id = $1 ORDER BY created_at DESC`;
        const { rows } = await db.query(query, [store_id]);
        return rows;
    }
}

module.exports = new Category();
