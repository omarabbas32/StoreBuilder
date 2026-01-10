const db = require('../config/database');

class BaseModel {
    constructor(tableName, allowedFields = []) {
        this.tableName = tableName;
        this.allowedFields = allowedFields;
    }

    async findAll(limit = 20, offset = 0) {
        const query = `SELECT * FROM ${this.tableName} LIMIT $1 OFFSET $2`;
        const { rows } = await db.query(query, [limit, offset]);
        return rows;
    }

    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async update(id, data) {
        // Filter data to only include allowed fields
        const filteredData = {};
        const keys = Object.keys(data);

        keys.forEach(key => {
            if (this.allowedFields.includes(key)) {
                filteredData[key] = data[key];
            }
        });

        const updateKeys = Object.keys(filteredData);
        if (updateKeys.length === 0) return null;

        const setClause = updateKeys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
        const values = [id, ...updateKeys.map(key => {
            const val = filteredData[key];
            return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
        })];

        const query = `
            UPDATE ${this.tableName}
            SET ${setClause}, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;

        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = BaseModel;
