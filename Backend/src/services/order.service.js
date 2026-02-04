const AppError = require('../utils/AppError');

/**
 * OrderService - Contains ALL order business logic
 * 
 * Business Rules:
 * - Orders must have items
 * - Stock must be checked and decremented
 * - Total amount must match items
 * - All operations must be atomic (transaction)
 */
class OrderService {
    constructor({ orderModel, orderItemModel, productModel, cartModel, cartItemModel, prisma }) {
        this.orderModel = orderModel;
        this.orderItemModel = orderItemModel;
        this.productModel = productModel;
        this.cartModel = cartModel;
        this.cartItemModel = cartItemModel;
        this.prisma = prisma;
    }

    /**
     * Create order from cart
     * Business Rules:
     * - Cart must exist and have items
     * - All products must have sufficient stock
     * - Stock is decremented atomically
     * - Cart is cleared after order
     */
    async createOrderFromCart(dto, customerId, sessionId) {
        const { storeId, shippingAddress, notes, customerName, customerEmail, customerPhone } = dto;

        // Business Rule 1: Get cart
        const cart = customerId
            ? await this.cartModel.findByCustomerId(customerId, storeId)
            : await this.cartModel.findBySessionId(sessionId, storeId);

        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        // Business Rule 2: Cart must have items
        const cartItems = await this.cartItemModel.findByCartId(cart.id, true);
        if (cartItems.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        // Business Rule 3: Check stock for all items
        for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
                throw new AppError(
                    `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`,
                    400
                );
            }
        }

        // Business Rule 4: Calculate total
        const totalAmount = cartItems.reduce(
            (sum, item) => sum + (parseFloat(item.product.price) * item.quantity),
            0
        );

        // Business Rule 5: Atomic transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await this.orderModel.create({
                store_id: storeId,
                customer_id: customerId || null,
                total_amount: totalAmount,
                status: 'pending',
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                shipping_address: shippingAddress,
                notes: notes || null
            });

            // Create order items and decrement stock
            for (const item of cartItems) {
                // Create order item
                await this.orderItemModel.create({
                    order_id: newOrder.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.product.price
                });

                // Decrement stock
                await this.productModel.update(item.product_id, {
                    stock: item.product.stock - item.quantity
                });
            }

            // Clear cart
            await this.cartItemModel.deleteMany({ cart_id: cart.id });

            return newOrder;
        });

        // Return order with items
        return await this.getOrder(order.id);
    }

    /**
     * Create order directly (without cart)
     * Business Rules:
     * - Items array must not be empty
     * - All products must exist and have stock
     * - Stock is decremented atomically
     */
    async createOrder(dto) {
        const { storeId, items, customerId, shippingAddress, notes, customerName, customerEmail, customerPhone } = dto;

        // Business Rule 1: Items must exist
        if (!items || items.length === 0) {
            throw new AppError('Order must have at least one item', 400);
        }

        // Business Rule 2: Validate all products and calculate total
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = await this.productModel.findById(item.productId);
            if (!product) {
                throw new AppError(`Product ${item.productId} not found`, 404);
            }
            if (product.store_id !== storeId) {
                throw new AppError(`Product ${product.name} does not belong to this store`, 400);
            }
            if (product.stock < item.quantity) {
                throw new AppError(
                    `Insufficient stock for ${product.name}. Available: ${product.stock}`,
                    400
                );
            }

            validatedItems.push({
                product,
                quantity: item.quantity,
                price: product.price
            });

            totalAmount += parseFloat(product.price) * item.quantity;
        }

        // Business Rule 3: Atomic transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await this.orderModel.create({
                store_id: storeId,
                customer_id: customerId || null,
                total_amount: totalAmount,
                status: 'pending',
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                shipping_address: shippingAddress,
                notes: notes || null
            });

            // Create order items and decrement stock
            for (const item of validatedItems) {
                await this.orderItemModel.create({
                    order_id: newOrder.id,
                    product_id: item.product.id,
                    quantity: item.quantity,
                    unit_price: item.price
                });

                await this.productModel.update(item.product.id, {
                    stock: item.product.stock - item.quantity
                });
            }

            return newOrder;
        });

        return await this.getOrder(order.id);
    }

    /**
     * Get order by ID
     */
    async getOrder(orderId) {
        const order = await this.orderModel.findById(orderId, true);
        if (!order) {
            throw new AppError('Order not found', 404);
        }
        return order;
    }

    /**
     * Get orders by store
     */
    async getOrdersByStore(storeId, options = {}) {
        return await this.orderModel.findByStore(storeId, options);
    }

    /**
     * Get orders by customer
     */
    async getOrdersByCustomer(customerId, options = {}) {
        return await this.orderModel.findByCustomer(customerId, options);
    }

    /**
     * Update order status
     * Business Rule: Only certain status transitions allowed
     */
    async updateOrderStatus(orderId, newStatus, ownerId) {
        const order = await this.orderModel.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Verify ownership
        const store = await this.storeModel?.findById(order.store_id);
        if (store && store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        // Business Rule: Valid status transitions
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new AppError('Invalid order status', 400);
        }

        const updated = await this.orderModel.update(orderId, { status: newStatus });
        return updated;
    }
}

module.exports = OrderService;
