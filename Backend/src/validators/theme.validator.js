const { z } = require('zod');

// Schema for creating a global theme (admin only)
const createThemeSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional().nullable(),
    config: z.record(z.any()).optional(),
    preview_url: z.string().optional().nullable(),
    is_active: z.boolean().optional().default(true)
});

// Schema for updating a theme
const updateThemeSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    config: z.record(z.any()).optional(),
    preview_url: z.string().optional().nullable(),
    is_active: z.boolean().optional()
});

// Schema for creating a user template
const createTemplateSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional().nullable(),
    config: z.record(z.any()).optional(),
    screenshot_url: z.string().optional().nullable()
});

module.exports = {
    createThemeSchema,
    updateThemeSchema,
    createTemplateSchema
};
