const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Theme extends BaseModel {
    constructor() {
        super('themes');
    }

    async create(data) {
        const { name, description, screenshot_url, config } = data;
        const query = `
            INSERT INTO themes (name, description, screenshot_url, config)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await db.query(query, [name, description, screenshot_url, config || {}]);
        return rows[0];
    }

    async findActive() {
        const query = `SELECT * FROM themes WHERE is_active = true ORDER BY name ASC`;
        const { rows } = await db.query(query);
        return rows;
    }
}

module.exports = new Theme();
