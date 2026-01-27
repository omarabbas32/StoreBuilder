const { z } = require('zod');

/**
 * Cart Validation Schemas
 */

const addItemSchema = z.object({
    productId: z.string().uuid({ message: 'Valid product ID is required' }),
    quantity: z.number()
        .int({ message: 'Quantity must be an integer' })
        .positive({ message: 'Quantity must be positive' })
        .max(999, { message: 'Quantity cannot exceed 999' })
        .default(1),
    storeId: z.string().uuid({ message: 'Valid store ID is required' })
});

const updateQuantitySchema = z.object({
    productId: z.string().uuid({ message: 'Valid product ID is required' }),
    quantity: z.number()
        .int({ message: 'Quantity must be an integer' })
        .positive({ message: 'Quantity must be positive' })
        .max(999, { message: 'Quantity cannot exceed 999' })
});

const removeItemSchema = z.object({
    productId: z.string().uuid({ message: 'Valid product ID is required' })
});

const getCartSchema = z.object({
    storeId: z.string().uuid({ message: 'Valid store ID is required' })
});

module.exports = {
    addItemSchema,
    updateQuantitySchema,
    removeItemSchema,
    getCartSchema
};
