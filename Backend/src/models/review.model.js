const prisma = require('../db/prismaClient');

/**
 * ReviewModel - Pure data access layer for ProductReview
 * RULES:
 * - Only CRUD operations
 * - No vote logic (moved to separate model)
 * - No transaction handling
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
                product_id: productId,
                ...(status && { status })
            },
            ...(includeCustomer && {
                include: {
                    customer: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            user: {
                                select: { name: true }
                            }
                        }
                    }
                }
            }),
            orderBy: { created_at: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });
    }

    async countByProduct(productId, status = 'approved') {
        return prisma.productReview.count({
            where: {
                product_id: productId,
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

    async incrementHelpfulCount(id) {
        return prisma.productReview.update({
            where: { id },
            data: {
                helpful_count: {
                    increment: 1
                }
            }
        });
    }
}

module.exports = new ReviewModel();
