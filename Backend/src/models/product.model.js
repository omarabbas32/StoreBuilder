const prisma = require('../db/prismaClient');

/**
 * ProductModel - Pure data access layer for Product
 * RULES:
 * - Only CRUD operations
 * - No stock validation logic
 */
class ProductModel {
    async findById(id) {
        return prisma.product.findUnique({
            where: { id }
        });
    }

    async findMany(where = {}, options = {}) {
        return prisma.product.findMany({
            where,
            ...options
        });
    }

    async create(data) {
        return prisma.product.create({
            data
        });
    }

    async update(id, data) {
        return prisma.product.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.product.delete({
            where: { id }
        });
    }

    async count(where = {}) {
        return prisma.product.count({
            where
        });
    }
}

module.exports = new ProductModel();
