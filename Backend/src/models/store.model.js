const prisma = require('../db/prismaClient');

/**
 * StoreModel - Pure data access layer for Store
 * RULES:
 * - Only CRUD operations
 * - No slug validation logic
 */
class StoreModel {
    async findById(id) {
        return prisma.store.findUnique({
            where: { id }
        });
    }

    async findBySlug(slug) {
        return prisma.store.findUnique({
            where: { slug }
        });
    }

    async findByOwner(ownerId) {
        return prisma.store.findMany({
            where: { owner_id: ownerId }
        });
    }

    async findAll(options = {}) {
        const { limit, offset } = options;
        return prisma.store.findMany({
            ...(limit && { take: parseInt(limit) }),
            ...(offset && { skip: parseInt(offset) }),
            orderBy: { created_at: 'desc' }
        });
    }

    async create(data) {
        return prisma.store.create({
            data
        });
    }

    async update(id, data) {
        return prisma.store.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.store.delete({
            where: { id }
        });
    }
}

module.exports = new StoreModel();
