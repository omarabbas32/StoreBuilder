const { z } = require('zod');

/**
 * Category Validation Schemas
 */

const createCategorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    description: z.string().optional().nullable(),
    image_url: z.string().url().or(z.literal('')).optional().nullable(),
    imageUrl: z.string().url().or(z.literal('')).optional().nullable(), // For frontend compatibility
    storeId: z.string().uuid(),
    parentId: z.string().uuid().optional().nullable()
});

const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    image_url: z.string().url().or(z.literal('')).optional().nullable(),
    imageUrl: z.string().url().or(z.literal('')).optional().nullable(), // For frontend compatibility
    parentId: z.string().uuid().optional().nullable()
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
};
