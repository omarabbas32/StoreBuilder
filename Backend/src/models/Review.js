const db = require('../config/database');

class Review {
    static async create(data) {
        const {
            product_id, store_id, customer_id, order_id,
            rating, title, comment, images, status, is_verified_purchase
        } = data;

        const query = `
      INSERT INTO product_reviews (
        product_id, store_id, customer_id, order_id,
        rating, title, comment, images, status, is_verified_purchase
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

        const values = [
            product_id, store_id, customer_id, order_id,
            rating, title, comment, JSON.stringify(images || []),
            status || 'pending', is_verified_purchase || false
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByProductId(productId, limit = 20, offset = 0, status = 'approved') {
        const query = `
      SELECT r.*, u.name as customer_name
      FROM product_reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE r.product_id = $1 AND r.status = $2
      ORDER BY r.created_at DESC
      LIMIT $3 OFFSET $4
    `;
        const { rows } = await db.query(query, [productId, status, limit, offset]);
        return rows;
    }

    static async countByProductId(productId, status = 'approved') {
        const query = `SELECT COUNT(*) FROM product_reviews WHERE product_id = $1 AND status = $2`;
        const { rows } = await db.query(query, [productId, status]);
        return parseInt(rows[0].count);
    }

    static async findById(id) {
        const query = `SELECT * FROM product_reviews WHERE id = $1`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async updateStatus(id, status) {
        const query = `
      UPDATE product_reviews 
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
        const { rows } = await db.query(query, [id, status]);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM product_reviews WHERE id = $1 RETURNING id`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async addHelpfulVote(reviewId, customerId) {
        const query = `
      INSERT INTO review_helpful_votes (review_id, customer_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
        const { rows } = await db.query(query, [reviewId, customerId]);

        if (rows.length > 0) {
            // Update helpful count on review
            await db.query(`UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = $1`, [reviewId]);
            return true;
        }
        return false;
    }
}

module.exports = Review;
