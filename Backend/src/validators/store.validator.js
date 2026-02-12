const { z } = require('zod');

/**
 * Store Validation Schemas
 */

const createStoreSchema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' }),
    description: z.string().optional(),
    tagline: z.string().max(255).optional(),
    business_hours: z.any().optional(),
    contact_email: z.string().email().optional().or(z.literal('')),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
    facebook_url: z.string().optional(),
    instagram_url: z.string().optional(),
    twitter_url: z.string().optional(),
    linkedin_url: z.string().optional(),
    tiktok_url: z.string().optional(),
    settings: z.any().optional()
});

const updateStoreSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    tagline: z.string().max(255).optional(),
    business_hours: z.any().optional(),
    contact_email: z.string().email().optional().or(z.literal('')),
    contact_phone: z.string().optional(),
    address: z.string().optional(),
    facebook_url: z.string().optional(),
    instagram_url: z.string().optional(),
    twitter_url: z.string().optional(),
    linkedin_url: z.string().optional(),
    tiktok_url: z.string().optional(),
    settings: z.any().optional()
});

module.exports = {
    createStoreSchema,
    updateStoreSchema
};
