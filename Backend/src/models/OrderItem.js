const BaseModel = require('./BaseModel');
const db = require('../config/database');

class OrderItem extends BaseModel {
    constructor() {
        super('order_items');
    }

    async create(data) {
        const { order_id, product_id, quantity, unit_price } = data;
        const query = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const { rows } = await db.query(query, [order_id, product_id, quantity, unit_price]);
        return rows[0];
    }
}

module.exports = new OrderItem();
