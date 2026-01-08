const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Component extends BaseModel {
    constructor() {
        super('components');
    }

    async create(data) {
        const { name, type, content_schema, screenshot_url } = data;
        const query = `
            INSERT INTO components (name, type, content_schema, screenshot_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await db.query(query, [name, type, content_schema || {}, screenshot_url]);
        return rows[0];
    }

    async findActive() {
        const query = `SELECT * FROM components WHERE is_active = true ORDER BY name ASC`;
        const { rows } = await db.query(query);
        return rows;
    }
}

module.exports = new Component();
