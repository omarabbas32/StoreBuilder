const AppError = require('../utils/AppError');

/**
 * CategoryService - Contains ALL category business logic
 * 
 * Business Rules:
 * - Categories belong to stores
 * - Slug must be unique within store
 * - Owner-only CRUD
 */
class CategoryService {
    constructor({ categoryModel, storeModel, prisma }) {
        this.categoryModel = categoryModel;
        this.storeModel = storeModel;
        this.prisma = prisma;
    }

    /**
     * Create category
     * Business Rules:
     * - Store must exist and belong to owner
     * - Slug must be unique within store
     */
    async createCategory(dto, ownerId) {
        const { name, slug, description, storeId, parentId } = dto;

        // Business Rule 1: Store must exist and belong to owner
        const store = await this.storeModel.findById(storeId);
        if (!store) {
            throw new AppError('Store not found', 404);
        }
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        // Create category
        const category = await this.categoryModel.create({
            name,
            slug,
            description: description || null,
            store_id: storeId,
            parent_id: parentId || null
        });

        return category;
    }

    /**
     * Get categories by store
     */
    async getCategoriesByStore(storeId, options = {}) {
        return await this.categoryModel.findByStore(storeId, options);
    }

    /**
     * Get category by ID
     */
    async getCategory(categoryId) {
        const category = await this.categoryModel.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        return category;
    }

    /**
     * Update category
     * Business Rule: Owner must own the store
     */
    async updateCategory(categoryId, dto, ownerId) {
        const category = await this.categoryModel.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        const store = await this.storeModel.findById(category.store_id);
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        const updated = await this.categoryModel.update(categoryId, dto);
        return updated;
    }

    /**
     * Delete category
     * Business Rule: Owner must own the store
     */
    async deleteCategory(categoryId, ownerId) {
        const category = await this.categoryModel.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        const store = await this.storeModel.findById(category.store_id);
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        await this.categoryModel.delete(categoryId);
        return { success: true, message: 'Category deleted successfully' };
    }
}

module.exports = CategoryService;
