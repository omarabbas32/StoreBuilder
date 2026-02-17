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
    constructor({ orderModel, orderItemModel, productModel, cartModel, cartItemModel, storeModel, customerModel, prisma, webhookService, notificationService }) {
        this.orderModel = orderModel;
        this.orderItemModel = orderItemModel;
        this.productModel = productModel;
        this.cartModel = cartModel;
        this.cartItemModel = cartItemModel;
        this.storeModel = storeModel;
        this.customerModel = customerModel;
        this.prisma = prisma;
        this.webhookService = webhookService;
        this.notificationService = notificationService;
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
        console.log('[DEBUG_ORDER_SERVICE] createOrderFromCart DTO:', JSON.stringify(dto, null, 2));
        const { storeId, shippingAddress, notes, customerName, customerEmail, customerPhone } = dto;

        // Resolve Real Customer ID if userId is provided
        let realCustomerId = null;
        if (customerId) {
            const customer = await this.customerModel.findByUserId(customerId);
            if (!customer) {
                // Auto-create customer profile if it doesn't exist
                const newCustomer = await this.customerModel.create({
                    user_id: customerId,
                    phone: customerPhone || null,
                    address: shippingAddress || {}
                });
                realCustomerId = newCustomer.id;
            } else {
                realCustomerId = customer.id;
            }
        }

        // Business Rule 1: Get cart
        const cart = customerId
            ? await this.cartModel.findByCustomerId(realCustomerId, storeId)
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

        const order = await this.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await this.orderModel.create({
                store_id: storeId,
                customer_id: realCustomerId || null,
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
                const newStock = item.product.stock - item.quantity;
                await this.productModel.update(item.product_id, {
                    stock: newStock
                });

                // Trigger stock.low webhook if stock becomes low
                if (this.webhookService && newStock <= 5) {
                    this.webhookService.trigger(storeId, 'stock.low', {
                        productId: item.product_id,
                        productName: item.product.name,
                        currentStock: newStock,
                        threshold: 5
                    }).catch(err => console.error('[Webhook] Failed to trigger stock.low from order (cart):', err.message));
                }

                // Create internal notification for low stock
                if (this.notificationService && newStock <= 5) {
                    this.notificationService.createNotification(storeId, {
                        type: 'stock.low',
                        title: 'Low Stock Alert',
                        message: `Product "${item.product.name}" is low on stock (${newStock} remains).`,
                        metadata: { productId: item.product_id, currentStock: newStock }
                    }).catch(err => console.error('[Notification] Failed to create low stock notification (cart):', err.message));
                }
            }

            // Clear cart
            await this.cartItemModel.deleteMany({ cart_id: cart.id });

            return newOrder;
        });

        // Return order with items
        const fullOrder = await this.getOrder(order.id);

        // Trigger order.created webhook
        if (this.webhookService) {
            this.webhookService.trigger(storeId, 'order.created', {
                orderId: fullOrder.id,
                orderNumber: fullOrder.id.substring(0, 8).toUpperCase(),
                customerName: fullOrder.customer_name,
                customerEmail: fullOrder.customer_email,
                totalAmount: fullOrder.total_amount,
                itemsCount: fullOrder.order_items?.length || 0,
                status: fullOrder.status,
                createdAt: fullOrder.created_at
            }).catch(err => console.error('[Webhook] Failed to trigger order.created (cart):', err.message));
        }

        // Create internal notification for new order
        if (this.notificationService) {
            this.notificationService.createNotification(storeId, {
                type: 'order.created',
                title: 'New Order Received',
                message: `Order #${fullOrder.id.substring(0, 8).toUpperCase()} placed by ${fullOrder.customer_name} for $${fullOrder.total_amount}.`,
                metadata: { orderId: fullOrder.id, totalAmount: fullOrder.total_amount }
            }).catch(err => console.error('[Notification] Failed to create new order notification (cart):', err.message));
        }

        return fullOrder;
    }

    /**
     * Create order directly (without cart)
     * Business Rules:
     * - Items array must not be empty
     * - All products must exist and have stock
     * - Stock is decremented atomically
     */
    async createOrder(dto) {
        console.log('[DEBUG_ORDER_SERVICE] createOrder DTO:', JSON.stringify(dto, null, 2));
        const { storeId, items, customerId, shippingAddress, notes, customerName, customerEmail, customerPhone } = dto;

        // customerId here is actually userId from the token
        let realCustomerId = null;
        if (customerId) {
            const customer = await this.customerModel.findByUserId(customerId);
            if (!customer) {
                const newCustomer = await this.customerModel.create({
                    user_id: customerId,
                    phone: customerPhone || null,
                    address: shippingAddress || {}
                });
                realCustomerId = newCustomer.id;
            } else {
                realCustomerId = customer.id;
            }
        }

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
                customer_id: realCustomerId || null,
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

                const newStock = item.product.stock - item.quantity;
                await this.productModel.update(item.product.id, {
                    stock: newStock
                });

                // Trigger stock.low webhook if stock becomes low
                if (this.webhookService && newStock <= 5) {
                    this.webhookService.trigger(storeId, 'stock.low', {
                        productId: item.product.id,
                        productName: item.product.name,
                        currentStock: newStock,
                        threshold: 5
                    }).catch(err => console.error('[Webhook] Failed to trigger stock.low from order:', err.message));
                }

                // Create internal notification for low stock
                if (this.notificationService && newStock <= 5) {
                    this.notificationService.createNotification(storeId, {
                        type: 'stock.low',
                        title: 'Low Stock Alert',
                        message: `Product "${item.product.name}" is low on stock (${newStock} remains).`,
                        metadata: { productId: item.product.id, currentStock: newStock }
                    }).catch(err => console.error('[Notification] Failed to create low stock notification:', err.message));
                }
            }

            return newOrder;
        });

        const fullOrder = await this.getOrder(order.id);

        // Trigger order.created webhook
        if (this.webhookService) {
            this.webhookService.trigger(storeId, 'order.created', {
                orderId: fullOrder.id,
                orderNumber: fullOrder.id.substring(0, 8).toUpperCase(),
                customerName: fullOrder.customer_name,
                customerEmail: fullOrder.customer_email,
                totalAmount: fullOrder.total_amount,
                itemsCount: fullOrder.order_items?.length || 0,
                status: fullOrder.status,
                createdAt: fullOrder.created_at
            }).catch(err => console.error('[Webhook] Failed to trigger order.created:', err.message));
        }

        // Create internal notification for new order
        if (this.notificationService) {
            this.notificationService.createNotification(storeId, {
                type: 'order.created',
                title: 'New Order Received',
                message: `Order #${fullOrder.id.substring(0, 8).toUpperCase()} placed by ${fullOrder.customer_name} for $${fullOrder.total_amount}.`,
                metadata: { orderId: fullOrder.id, totalAmount: fullOrder.total_amount }
            }).catch(err => console.error('[Notification] Failed to create new order notification:', err.message));
        }

        return fullOrder;
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
        const { limit = 20, page = 1, status, startDate, endDate } = options;
        const offset = (page - 1) * limit;

        const where = { store_id: storeId };

        if (status && status !== 'all') {
            where.status = status;
        }

        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) {
                where.created_at.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.created_at.lte = end;
            }
        }

        const [orders, total] = await Promise.all([
            this.orderModel.findByStore(storeId, { limit, offset, where }),
            this.orderModel.count(where)
        ]);

        return {
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        };
    }

    /**
     * Get orders by customer
     */
    async getOrdersByCustomer(customerId, options = {}) {
        const { limit = 20, page = 1 } = options;
        const offset = (page - 1) * limit;

        // Resolve Real Customer ID
        const customer = await this.customerModel.findByUserId(customerId);
        if (!customer) {
            return {
                orders: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            };
        }

        const realCustomerId = customer.id;
        const where = { customer_id: realCustomerId };

        const [orders, total] = await Promise.all([
            this.orderModel.findByCustomer(realCustomerId, { limit, offset }),
            this.orderModel.count(where)
        ]);

        return {
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        };
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

        // Trigger webhook event
        if (this.webhookService) {
            this.webhookService.trigger(order.store_id, `order.${newStatus === 'delivered' ? 'completed' : 'updated'}`, {
                orderId: order.id,
                status: newStatus,
                customerName: order.customer_name,
                totalAmount: order.total_amount
            }).catch(err => console.error(`[Webhook] Failed to trigger order.${newStatus}:`, err.message));
        }

        // Trigger internal notification for specific statuses
        if (this.notificationService) {
            let notificationData = null;
            if (newStatus === 'delivered') {
                notificationData = {
                    type: 'order',
                    title: 'Order Delivered',
                    message: `Order #${order.id.substring(0, 8)} has been marked as delivered.`,
                    metadata: { orderId: order.id }
                };
            } else if (newStatus === 'cancelled') {
                notificationData = {
                    type: 'order',
                    title: 'Order Cancelled',
                    message: `Order #${order.id.substring(0, 8)} has been cancelled.`,
                    metadata: { orderId: order.id }
                };
            }

            if (notificationData) {
                this.notificationService.createNotification(order.store_id, notificationData)
                    .catch(err => console.error('[Notification] Failed to create status notification:', err.message));
            }
        }

        return updated;
    }
}

module.exports = OrderService;
