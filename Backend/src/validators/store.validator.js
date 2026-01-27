const { z } = require('zod');

/**
 * Store Validation Schemas
 */

const createStoreSchema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' }),
    description: z.string().optional(),
    settings: z.object({}).passthrough().optional()
});

const updateStoreSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    settings: z.object({}).passthrough().optional()
});

module.exports = {
    createStoreSchema,
    updateStoreSchema
};
