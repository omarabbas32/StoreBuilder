const { z } = require('zod');

/**
 * Product Validation Schemas
 */

const createProductSchema = z.object({
    storeId: z.string().uuid({ message: 'Valid store ID is required' }),
    name: z.string()
        .min(1, { message: 'Product name is required' })
        .max(255, { message: 'Product name cannot exceed 255 characters' }),
    description: z.string().optional(),
    price: z.coerce.number()
        .positive({ message: 'Price must be positive' })
        .max(9999999.99, { message: 'Price is too large' }),
    stock: z.coerce.number()
        .int({ message: 'Stock must be an integer' })
        .min(0, { message: 'Stock cannot be negative' })
        .default(0),
    categoryId: z.string().uuid({ message: 'Valid category ID is required' }).optional(),
    images: z.array(z.string().url()).optional().default([])
});

const updateProductSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    price: z.number().positive().max(9999999.99).optional(),
    stock: z.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string().url()).optional()
});

const reorderProductsSchema = z.object({
    productIds: z.array(z.string().uuid())
        .min(1, { message: 'At least one product ID is required' })
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    reorderProductsSchema
};
