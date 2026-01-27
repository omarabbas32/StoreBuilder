const { z } = require('zod');

/**
 * Order Validation Schemas
 */

const createOrderSchema = z.object({
    storeId: z.string().uuid({ message: 'Valid store ID is required' }),
    customerName: z.string().min(1, { message: 'Customer name is required' }),
    customerEmail: z.string().email({ message: 'Valid email is required' }),
    customerPhone: z.string().min(5, { message: 'Phone number is too short' }),
    shippingAddress: z.object({
        address: z.string().min(1),
        city: z.string().min(1),
        country: z.string().min(1),
        zipCode: z.string().optional()
    }),
    notes: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive()
    })).min(1, { message: 'Order must have at least one item' })
});

const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
