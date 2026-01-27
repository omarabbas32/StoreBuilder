const AppError = require('../utils/AppError');
const CartResponseDTO = require('../dtos/cart/CartResponse.dto');

/**
 * CartService - Contains ALL cart business logic
 * 
 * RULES:
 * - All business decisions live here
 * - Models are ONLY called for data access
 * - Transactions for race-condition safety
 * - Throws AppError for business rule violations
 */
class CartService {
    constructor({ cartModel, cartItemModel, productModel, prisma }) {
        this.cartModel = cartModel;
        this.cartItemModel = cartItemModel;
        this.productModel = productModel;
        this.prisma = prisma;
    }

    /**
     * Get or create cart for customer/session
     * Business Rule: One cart per customer/session per store
     */
    async getOrCreateCart(customerId, sessionId, storeId) {
        // Business logic: Try customer first, then session
        let cart = customerId
            ? await this.cartModel.findByCustomerId(customerId, storeId)
            : await this.cartModel.findBySessionId(sessionId, storeId);

        if (!cart) {
            cart = await this.cartModel.create({
                customer_id: customerId || null,
                session_id: sessionId,
                store_id: storeId
            });
        }

        return cart;
    }

    /**
     * Add item to cart
     * Business Rules:
     * - Product must exist
     * - Product must have sufficient stock
     * - If item exists, merge quantities
     * - Merged quantity cannot exceed stock
     */
    async addItem(dto, customerId, sessionId) {
        const { productId, quantity, storeId } = dto;

        // Business Rule 1: Product must exist
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Business Rule 2: Product must belong to the store
        if (product.store_id !== storeId) {
            throw new AppError('Product does not belong to this store', 400);
        }

        // Business Rule 3: Sufficient stock check
        if (product.stock < quantity) {
            throw new AppError(`Insufficient stock. Available: ${product.stock}`, 400);
        }

        // Transaction for race-condition safety
        return await this.prisma.$transaction(async (tx) => {
            // Get or create cart within transaction
            const cart = await this.getOrCreateCart(customerId, sessionId, storeId);

            // Check if item already exists in cart
            const existingItem = await this.cartItemModel.findByCartAndProduct(
                cart.id,
                productId
            );

            if (existingItem) {
                // Business Rule 4: Merged quantity cannot exceed stock
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > product.stock) {
                    throw new AppError(
                        `Cannot add ${quantity}. Already have ${existingItem.quantity} in cart. Stock: ${product.stock}`,
                        400
                    );
                }

                // Update existing item
                await this.cartItemModel.update(existingItem.id, {
                    quantity: newQuantity
                });
            } else {
                // Create new cart item
                await this.cartItemModel.create({
                    cart_id: cart.id,
                    product_id: productId,
                    quantity
                });
            }

            // Return cart with items
            const items = await this.cartItemModel.findByCartId(cart.id, true);
            return new CartResponseDTO(cart, items);
        });
    }

    /**
     * Update cart item quantity
     * Business Rules:
     * - Item must exist in cart
     * - New quantity cannot exceed stock
     */
    async updateQuantity(dto, customerId, sessionId, storeId) {
        const { productId, quantity } = dto;

        // Business Rule 1: Get cart
        const cart = customerId
            ? await this.cartModel.findByCustomerId(customerId, storeId)
            : await this.cartModel.findBySessionId(sessionId, storeId);

        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        // Business Rule 2: Item must exist
        const existingItem = await this.cartItemModel.findByCartAndProduct(
            cart.id,
            productId
        );

        if (!existingItem) {
            throw new AppError('Item not found in cart', 404);
        }

        // Business Rule 3: Check stock
        const product = await this.productModel.findById(productId);
        if (quantity > product.stock) {
            throw new AppError(`Insufficient stock. Available: ${product.stock}`, 400);
        }

        // Update item
        await this.cartItemModel.update(existingItem.id, { quantity });

        // Return updated cart
        const items = await this.cartItemModel.findByCartId(cart.id, true);
        return new CartResponseDTO(cart, items);
    }

    /**
     * Remove item from cart
     * Business Rule: Item must exist
     */
    async removeItem(dto, customerId, sessionId, storeId) {
        const { productId } = dto;

        const cart = customerId
            ? await this.cartModel.findByCustomerId(customerId, storeId)
            : await this.cartModel.findBySessionId(sessionId, storeId);

        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        const existingItem = await this.cartItemModel.findByCartAndProduct(
            cart.id,
            productId
        );

        if (!existingItem) {
            throw new AppError('Item not found in cart', 404);
        }

        await this.cartItemModel.delete(existingItem.id);

        // Return updated cart
        const items = await this.cartItemModel.findByCartId(cart.id, true);
        return new CartResponseDTO(cart, items);
    }

    /**
     * Get current cart
     */
    async getCart(customerId, sessionId, storeId) {
        const cart = customerId
            ? await this.cartModel.findByCustomerId(customerId, storeId)
            : await this.cartModel.findBySessionId(sessionId, storeId);

        if (!cart) {
            return CartResponseDTO.empty();
        }

        const items = await this.cartItemModel.findByCartId(cart.id, true);
        return new CartResponseDTO(cart, items);
    }

    /**
     * Clear cart
     */
    async clearCart(customerId, sessionId, storeId) {
        const cart = customerId
            ? await this.cartModel.findByCustomerId(customerId, storeId)
            : await this.cartModel.findBySessionId(sessionId, storeId);

        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        await this.cartItemModel.deleteMany({ cart_id: cart.id });

        return CartResponseDTO.empty();
    }
}

module.exports = CartService;
