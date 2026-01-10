const BaseModel = require('./BaseModel');
const db = require('../config/database');

class User extends BaseModel {
    constructor() {
        super('users', ['name', 'email', 'password', 'role', 'is_verified']);
    }

    async findByEmail(email) {
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }

    async create(data) {
        const { email, password, role, name } = data;
        const query = `
      INSERT INTO users (email, password, role, name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, role, name
    `;
        const { rows } = await db.query(query, [email, password, role || 'customer', name]);
        return rows[0];
    }

    async updateVerificationToken(id, token) {
        const query = `UPDATE users SET verification_token = $2 WHERE id = $1`;
        await db.query(query, [id, token]);
    }

    async verifyEmail(token) {
        const query = `UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING *`;
        const { rows } = await db.query(query, [token]);
        return rows[0];
    }

    async setResetToken(email, token, expires) {
        const query = `UPDATE users SET reset_token = $2, reset_expires = $3 WHERE email = $1 RETURNING *`;
        const { rows } = await db.query(query, [email, token, expires]);
        return rows[0];
    }

    async findByResetToken(token) {
        const query = `SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()`;
        const { rows } = await db.query(query, [token]);
        return rows[0];
    }

    async updatePassword(id, password) {
        const query = `UPDATE users SET password = $2, reset_token = NULL, reset_expires = NULL WHERE id = $1`;
        await db.query(query, [id, password]);
    }
}

module.exports = new User();
