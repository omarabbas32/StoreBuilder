const prisma = require('../db/prismaClient');

/**
 * OrderModel - Pure data access layer for Order
 * RULES:
 * - Only CRUD operations
 * - No nested creation logic (moved to service)
 * - No business validation
 */
class OrderModel {
    async findById(id, includeItems = false) {
        return prisma.order.findUnique({
            where: { id },
            ...(includeItems && {
                include: {
                    order_items: {
                        include: {
                            product: true
                        }
                    }
                }
            })
        });
    }

    async findByStore(storeId, options = {}) {
        const { limit, offset, includeItems = true, where: customWhere } = options;
        const where = customWhere || { store_id: storeId };

        return prisma.order.findMany({
            where,
            orderBy: { created_at: 'desc' },
            ...(limit && { take: parseInt(limit) }),
            ...(offset && { skip: parseInt(offset) }),
            ...(includeItems && {
                include: {
                    order_items: {
                        include: {
                            product: true
                        }
                    }
                }
            })
        });
    }

    async findByCustomer(customerId, options = {}) {
        const { limit, offset, includeItems = true } = options;
        return prisma.order.findMany({
            where: { customer_id: customerId },
            orderBy: { created_at: 'desc' },
            ...(limit && { take: parseInt(limit) }),
            ...(offset && { skip: parseInt(offset) }),
            ...(includeItems && {
                include: {
                    order_items: {
                        include: {
                            product: true
                        }
                    }
                }
            })
        });
    }

    async create(data) {
        return prisma.order.create({
            data
        });
    }

    async update(id, data) {
        return prisma.order.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.order.delete({
            where: { id }
        });
    }

    async count(where = {}) {
        return prisma.order.count({
            where
        });
    }
}

module.exports = new OrderModel();
