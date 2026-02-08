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
    constructor({ storeModel, userModel, categoryModel, prisma }) {
        this.storeModel = storeModel;
        this.userModel = userModel;
        this.categoryModel = categoryModel;
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
        const {
            name, slug, description, tagline, business_hours,
            contact_email, contact_phone, address,
            facebook_url, instagram_url, twitter_url, linkedin_url, tiktok_url,
            settings
        } = dto;

        // Business Rule 1: User must exist (if ownerId is provided)
        if (ownerId) {
            const user = await this.userModel.findById(ownerId).catch(() => null);
            if (!user) {
                throw new AppError('Owner user not found', 404);
            }
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
            tagline: tagline || null,
            business_hours: business_hours || {},
            contact_email: contact_email || null,
            contact_phone: contact_phone || null,
            address: address || null,
            facebook_url: facebook_url || null,
            instagram_url: instagram_url || null,
            twitter_url: twitter_url || null,
            linkedin_url: linkedin_url || null,
            tiktok_url: tiktok_url || null,
            settings: settings || {}
        });

        // Business Rule: Automatically create a default category "All Products"
        if (this.categoryModel) {
            await this.categoryModel.create({
                store_id: store.id,
                name: 'All Products',
                slug: 'all-products',
                description: 'Default category for all your products'
            }).catch(err => {
                console.error('[StoreService] Failed to create default category:', err.message);
                // We don't throw here to avoid failing the whole store creation
            });
        }

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
        let finalDto = { ...dto };

        // Handle deep merge for settings to prevent data loss
        if (dto.settings) {
            const currentSettings = store.settings || {};
            finalDto.settings = {
                ...currentSettings,
                ...dto.settings,
                // Handle nested objects like componentContent
                componentContent: {
                    ...(currentSettings.componentContent || {}),
                    ...(dto.settings.componentContent || {})
                },
                // Handle nested navigation links if present
                navbar_config: {
                    ...(currentSettings.navbar_config || {}),
                    ...(dto.settings.navbar_config || {})
                }
            };
        }

        const updated = await this.storeModel.update(storeId, finalDto);
        return updated;
    }

    async updateComponentContent(storeId, componentId, content, ownerId) {
        const store = await this.storeModel.findById(storeId);
        if (!store) throw new AppError('Store not found', 404);
        if (store.owner_id !== ownerId) throw new AppError('Unauthorized', 403);

        const settings = store.settings || {};
        const componentContent = settings.componentContent || {};

        // Merge content
        componentContent[componentId] = {
            ...(componentContent[componentId] || {}),
            ...content
        };

        settings.componentContent = componentContent;

        return await this.storeModel.update(storeId, { settings });
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
     * Get store by ID with ownership check
     * Used by controllers to verify store belongs to user
     */
    async getById(storeId, ownerId) {
        const store = await this.storeModel.findById(storeId);
        if (!store) {
            throw new AppError('Store not found', 404);
        }
        if (ownerId && store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
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
