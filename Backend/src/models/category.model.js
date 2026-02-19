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

    async findByStore(store_id, options = {}) {
        console.log('[DEBUG_CATEGORY_MODEL] findByStore:', { store_id, options });
        try {
            // Simplify query to isolate the issue
            const results = await prisma.category.findMany({
                where: { store_id }
            });
            console.log('[DEBUG_CATEGORY_MODEL] Found categories:', results.length);
            return results;
        } catch (error) {
            console.error('[DEBUG_CATEGORY_MODEL] findMany failed:', error);
            throw error;
        }
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
