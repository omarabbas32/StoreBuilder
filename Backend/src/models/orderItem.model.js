const prisma = require('../db/prismaClient');

/**
 * OrderItemModel - Pure data access layer for OrderItem
 * RULES:
 * - Only CRUD operations
 * - No validation logic
 */
class OrderItemModel {
    async findById(id) {
        return prisma.orderItem.findUnique({
            where: { id }
        });
    }

    async findByOrder(orderId) {
        return prisma.orderItem.findMany({
            where: { order_id: orderId },
            include: {
                product: true
            }
        });
    }

    async create(data) {
        return prisma.orderItem.create({
            data
        });
    }

    async createMany(items) {
        return prisma.orderItem.createMany({
            data: items
        });
    }

    async update(id, data) {
        return prisma.orderItem.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.orderItem.delete({
            where: { id }
        });
    }
}

module.exports = new OrderItemModel();
