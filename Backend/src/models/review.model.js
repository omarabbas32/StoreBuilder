const prisma = require('../db/prismaClient');

/**
 * ReviewModel - Pure data access layer for ProductReview
 * RULES:
 * - Only CRUD and atomic increments
 * - No complex business logic (moved to service)
 * - No transaction management here
 */
class ReviewModel {
    async findById(id) {
        return prisma.productReview.findUnique({
            where: { id }
        });
    }

    async findByProduct(productId, options = {}) {
        const {
            limit = 20,
            offset = 0,
            status = 'approved',
            includeCustomer = true
        } = options;

        return prisma.productReview.findMany({
            where: {
                productId: productId,
                ...(status && { status })
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });
    }

    async countByProduct(productId, status = 'approved') {
        return prisma.productReview.count({
            where: {
                productId: productId,
                ...(status && { status })
            }
        });
    }

    async create(data) {
        return prisma.productReview.create({
            data
        });
    }

    async update(id, data) {
        return prisma.productReview.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.productReview.delete({
            where: { id }
        });
    }

    async findByStore(storeId, options = {}) {
        const { limit = 20, offset = 0, status = null } = options;

        return prisma.productReview.findMany({
            where: {
                storeId: storeId,
                ...(status && { status })
            },
            include: {
                product: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });
    }

    async countByStore(storeId, status = null) {
        return prisma.productReview.count({
            where: {
                storeId: storeId,
                ...(status && { status })
            }
        });
    }

    async incrementHelpfulCount(id) {
        return prisma.productReview.update({
            where: { id },
            data: {
                helpfulCount: {
                    increment: 1
                }
            }
        });
    }
}

module.exports = new ReviewModel();
