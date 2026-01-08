const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Store extends BaseModel {
    constructor() {
        super('stores');
    }

    async create(data) {
        const { owner_id, name, slug, description, settings } = data;
        const query = `
      INSERT INTO stores (owner_id, name, slug, description, settings)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [owner_id, name, slug, description, JSON.stringify(settings || {})];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    async findBySlug(slug) {
        const query = `SELECT * FROM stores WHERE slug = $1`;
        const { rows } = await db.query(query, [slug]);
        return rows[0];
    }

    async findByOwner(ownerId) {
        const query = `SELECT * FROM stores WHERE owner_id = $1`;
        const { rows } = await db.query(query, [ownerId]);
        return rows;
    }
}

module.exports = new Store();
