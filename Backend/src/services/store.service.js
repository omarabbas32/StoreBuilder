const AppError = require('../utils/AppError');

/**
 * StoreService - Contains ALL store business logic
 * 
 * Business Rules:
 * - Slug must be unique
 * - Owner can only create/edit their own stores
 * - Store deletion cascades (handled by DB)
 */
class StoreService {
    constructor({ storeModel, userModel, prisma }) {
        this.storeModel = storeModel;
        this.userModel = userModel;
        this.prisma = prisma;
    }

    /**
     * Create store
     * Business Rules:
     * - User must exist
     * - Slug must be unique
     * - Slug must be valid format
     */
    async createStore(dto, ownerId) {
        const { name, slug, description, settings } = dto;

        // Business Rule 1: User must exist
        const user = await this.userModel.findById(ownerId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Business Rule 2: Slug must be unique
        const existingStore = await this.storeModel.findBySlug(slug);
        if (existingStore) {
            throw new AppError('Store slug already taken', 409);
        }

        // Business Rule 3: Validate slug format
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            throw new AppError('Slug must contain only lowercase letters, numbers, and hyphens', 400);
        }

        // Create store
        const store = await this.storeModel.create({
            owner_id: ownerId,
            name,
            slug,
            description: description || null,
            settings: settings || {}
        });

        return store;
    }

    /**
     * Update store
     * Business Rules:
     * - Store must exist
     * - User must own the store
     * - If updating slug, must be unique
     */
    async updateStore(storeId, dto, ownerId) {
        // Business Rule 1: Store must exist
        const store = await this.storeModel.findById(storeId);
        if (!store) {
            throw new AppError('Store not found', 404);
        }

        // Business Rule 2: Owner validation
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        // Business Rule 3: If updating slug, check uniqueness
        if (dto.slug && dto.slug !== store.slug) {
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(dto.slug)) {
                throw new AppError('Slug must contain only lowercase letters, numbers, and hyphens', 400);
            }

            const existingStore = await this.storeModel.findBySlug(dto.slug);
            if (existingStore) {
                throw new AppError('Store slug already taken', 409);
            }
        }

        // Update store
        const updated = await this.storeModel.update(storeId, dto);
        return updated;
    }

    /**
     * Get store by slug (public)
     */
    async getStoreBySlug(slug) {
        const store = await this.storeModel.findBySlug(slug);
        if (!store) {
            throw new AppError('Store not found', 404);
        }
        return store;
    }

    /**
     * Get store by ID
     */
    async getStore(storeId) {
        const store = await this.storeModel.findById(storeId);
        if (!store) {
            throw new AppError('Store not found', 404);
        }
        return store;
    }

    /**
     * Get stores by owner
     */
    async getStoresByOwner(ownerId) {
        return await this.storeModel.findByOwner(ownerId);
    }

    /**
     * Get all stores (admin/public listing)
     */
    async getAllStores(options = {}) {
        return await this.storeModel.findAll(options);
    }

    /**
     * Delete store
     * Business Rule: User must own the store
     */
    async deleteStore(storeId, ownerId) {
        const store = await this.storeModel.findById(storeId);
        if (!store) {
            throw new AppError('Store not found', 404);
        }

        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        await this.storeModel.delete(storeId);
        return { success: true, message: 'Store deleted successfully' };
    }
}

module.exports = StoreService;
