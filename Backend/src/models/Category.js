const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Category extends BaseModel {
    constructor() {
        super('categories', ['name', 'description', 'store_id']);
    }

    async create(data) {
        const { name, slug, parent_id } = data;
        const query = `
      INSERT INTO categories (name, slug, parent_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
        const { rows } = await db.query(query, [name, slug, parent_id]);
        return rows[0];
    }
}

module.exports = new Category();
