const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Theme extends BaseModel {
    constructor() {
        super('themes');
    }

    async create(data) {
        const { name, description, screenshot_url, config, user_id } = data;
        const query = `
            INSERT INTO themes (name, description, screenshot_url, config, user_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows } = await db.query(query, [name, description, screenshot_url, config || {}, user_id || null]);
        return rows[0];
    }

    async findActive(userId = null) {
        // If userId provided, include their custom templates + public ones
        const query = `
            SELECT * FROM themes 
            WHERE is_active = true 
            AND (user_id IS NULL OR user_id = $1)
            ORDER BY (user_id IS NOT NULL) DESC, name ASC
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }
}

module.exports = new Theme();
