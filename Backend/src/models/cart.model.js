const prisma = require('../db/prismaClient');

/**
 * CartModel - Pure data access layer for Cart
 * RULES:
 * - Only CRUD operations
 * - No business logic
 * - No "if exists, then update" logic
 */
class CartModel {
    async findById(id) {
        return prisma.cart.findUnique({
            where: { id }
        });
    }

    async findByCustomerId(customerId, storeId) {
        return prisma.cart.findFirst({
            where: {
                customer_id: customerId,
                store_id: storeId
            }
        });
    }

    async findBySessionId(sessionId, storeId) {
        return prisma.cart.findFirst({
            where: {
                session_id: sessionId,
                store_id: storeId
            }
        });
    }

    async create(data) {
        return prisma.cart.create({
            data
        });
    }

    async update(id, data) {
        return prisma.cart.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.cart.delete({
            where: { id }
        });
    }
}

module.exports = new CartModel();
