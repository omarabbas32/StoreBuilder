const AppError = require('../utils/AppError');
const ProductResponseDTO = require('../dtos/product/ProductResponse.dto');

/**
 * ProductService - Contains ALL product business logic
 * 
 * Business Rules:
 * - Products belong to stores
 * - Stock cannot be negative
 * - Reorder operations must be atomic
 * - Price validation
 */
class ProductService {
    constructor({ productModel, storeModel, categoryModel, prisma, webhookService, notificationService }) {
        this.productModel = productModel;
        this.storeModel = storeModel;
        this.categoryModel = categoryModel;
        this.prisma = prisma;
        this.webhookService = webhookService;
        this.notificationService = notificationService;
    }

    /**
     * Create product
     * Business Rules:
     * - Store must exist
     * - Category must exist and belong to store
     * - Price must be positive
     * - Stock must be non-negative
     */
    async createProduct(dto, ownerId) {
        const { storeId, categoryId, price, stock } = dto;

        // Business Rule 1: Store must exist and belong to owner
        const store = await this.storeModel.findById(storeId);
        if (!store) {
            throw new AppError('Store not found', 404);
        }
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        // Business Rule 2: Category must exist and belong to store
        const category = await this.categoryModel.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        if (category.store_id !== storeId) {
            throw new AppError('Category does not belong to this store', 400);
        }

        // Business Rule 3: Validation
        if (price <= 0) {
            throw new AppError('Price must be positive', 400);
        }
        if (stock < 0) {
            throw new AppError('Stock cannot be negative', 400);
        }

        // Create product
        const product = await this.productModel.create({
            store_id: storeId,
            name: dto.name,
            description: dto.description,
            price: dto.price,
            stock: dto.stock,
            category_id: categoryId,
            images: dto.images || []
        });

        return new ProductResponseDTO(product);
    }

    /**
     * Update product
     * Business Rules:
     * - Product must exist
     * - Owner must own the store
     * - Price/stock validation
     */
    async updateProduct(productId, dto, ownerId) {
        // Business Rule 1: Product must exist
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Business Rule 2: Store ownership
        const store = await this.storeModel.findById(product.store_id);
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        // Business Rule 3: Validation
        if (dto.price !== undefined && dto.price <= 0) {
            throw new AppError('Price must be positive', 400);
        }
        if (dto.stock !== undefined && dto.stock < 0) {
            throw new AppError('Stock cannot be negative', 400);
        }

        // Update product
        const updated = await this.productModel.update(productId, dto);

        // Trigger stock.low webhook if stock is low (threshold: 5)
        if (this.webhookService && updated.stock !== null && updated.stock <= 5) {
            this.webhookService.trigger(updated.store_id, 'stock.low', {
                productId: updated.id,
                productName: updated.name,
                currentStock: updated.stock,
                threshold: 5
            }).catch(err => console.error('[Webhook] Failed to trigger stock.low:', err.message));
        }

        // Create internal notification for low stock
        if (this.notificationService && updated.stock !== null && updated.stock <= 5) {
            this.notificationService.createNotification(updated.store_id, {
                type: 'stock.low',
                title: 'Low Stock Alert',
                message: `Product "${updated.name}" is low on stock (${updated.stock} remains).`,
                metadata: { productId: updated.id, currentStock: updated.stock }
            }).catch(err => console.error('[Notification] Failed to create low stock notification:', err.message));
        }

        return new ProductResponseDTO(updated);
    }

    /**
     * Get all products with optional filters
     */
    async getAllProducts(options = {}) {
        const { limit = 20, page = 1, categoryId, storeId } = options;
        const offset = (page - 1) * limit;

        const where = {};
        const activeCategoryId = categoryId || options.category_id;
        const activeStoreId = storeId || options.store_id;

        if (activeCategoryId) where.category_id = activeCategoryId;
        if (activeStoreId) where.store_id = activeStoreId;

        const [products, total] = await Promise.all([
            this.productModel.findMany(where, {
                orderBy: { created_at: 'desc' },
                take: parseInt(limit),
                skip: parseInt(offset)
            }),
            this.productModel.count(where)
        ]);

        return {
            products: ProductResponseDTO.fromArray(products),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        };
    }

    /**
     * Get products by store
     */
    async getProductsByStore(storeId, options = {}) {
        const { limit = 20, page = 1 } = options;
        const offset = (page - 1) * limit;

        const where = { store_id: storeId };

        const [products, total] = await Promise.all([
            this.productModel.findMany(
                where,
                {
                    orderBy: [
                        { sort_order: 'asc' },
                        { created_at: 'desc' }
                    ],
                    take: parseInt(limit),
                    skip: parseInt(offset)
                }
            ),
            this.productModel.count(where)
        ]);

        return {
            products: ProductResponseDTO.fromArray(products),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        };
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(categoryId, storeId, options = {}) {
        const { limit = 50, offset = 0 } = options;

        const where = { category_id: categoryId };
        if (storeId) {
            where.store_id = storeId;
        }

        const products = await this.productModel.findMany(where, {
            orderBy: [
                { sort_order: 'asc' },
                { created_at: 'desc' }
            ],
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        return ProductResponseDTO.fromArray(products);
    }

    /**
     * Reorder products
     * Business Rules:
     * - All products must exist
     * - All products must belong to same store
     * - Owner must own the store
     * - Operation must be atomic
     */
    async reorderProducts(dto, ownerId) {
        const { productIds } = dto;

        // Business Rule 1: Get all products
        const products = await Promise.all(
            productIds.map(id => this.productModel.findById(id))
        );

        // Check all exist
        if (products.some(p => !p)) {
            throw new AppError('One or more products not found', 404);
        }

        // Business Rule 2: All must belong to same store
        const storeIds = [...new Set(products.map(p => p.store_id))];
        if (storeIds.length > 1) {
            throw new AppError('All products must belong to the same store', 400);
        }

        // Business Rule 3: Owner must own the store
        const store = await this.storeModel.findById(storeIds[0]);
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        // Business Rule 4: Atomic transaction
        await this.prisma.$transaction(
            productIds.map((id, index) =>
                this.prisma.product.update({
                    where: { id },
                    data: { sort_order: index }
                })
            )
        );

        return { success: true, message: 'Products reordered successfully' };
    }

    /**
     * Delete product
     * Business Rule: Owner must own the store
     */
    async deleteProduct(productId, ownerId) {
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const store = await this.storeModel.findById(product.store_id);
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        await this.productModel.delete(productId);
        return { success: true, message: 'Product deleted successfully' };
    }

    /**
     * Get single product
     */
    async getProduct(productId) {
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return new ProductResponseDTO(product);
    }
}

module.exports = ProductService;
