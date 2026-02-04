const { z } = require('zod');

/**
 * Order Validation Schemas
 */

const createOrderSchema = z.object({
    storeId: z.any().optional(),
    store_id: z.any().optional(),
    customerName: z.any().optional(),
    customer_name: z.any().optional(),
    customerEmail: z.any().optional(),
    customer_email: z.any().optional(),
    customerPhone: z.any().optional(),
    customer_phone: z.any().optional(),
    shippingAddress: z.any().optional(),
    shipping_address: z.any().optional(),
    notes: z.any().optional(),
    items: z.array(z.any()).min(1, { message: 'Order must have at least one item' })
}).refine(data => data.storeId || data.store_id, {
    message: "Store ID is required",
    path: ["storeId"]
});

const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
