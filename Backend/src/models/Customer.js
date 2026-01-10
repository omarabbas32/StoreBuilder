const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Customer extends BaseModel {
    constructor() {
        super('customers', ['user_id', 'first_name', 'last_name', 'phone', 'address']);
    }

    async create(data) {
        const { user_id, first_name, last_name, phone, address } = data;
        const query = `
      INSERT INTO customers (user_id, first_name, last_name, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [user_id, first_name, last_name, phone, JSON.stringify(address || {})];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = new Customer();
