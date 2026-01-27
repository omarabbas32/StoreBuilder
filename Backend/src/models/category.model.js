const prisma = require('../db/prismaClient');

/**
 * CategoryModel - Pure data access layer for Category
 * RULES:
 * - Only CRUD operations
 * - No hierarchical logic
 */
class CategoryModel {
    async findById(id) {
        return prisma.category.findUnique({
            where: { id }
        });
    }

    async findByStore(storeId, options = {}) {
        const { limit, offset } = options;
        return prisma.category.findMany({
            where: { store_id: storeId },
            orderBy: { created_at: 'desc' },
            ...(limit && { take: parseInt(limit) }),
            ...(offset && { skip: parseInt(offset) })
        });
    }

    async create(data) {
        return prisma.category.create({
            data
        });
    }

    async update(id, data) {
        return prisma.category.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.category.delete({
            where: { id }
        });
    }
}

module.exports = new CategoryModel();
