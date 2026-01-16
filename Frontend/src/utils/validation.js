import { z } from 'zod';

export const typographySchema = z.object({
    fontFamily: z.string().min(1, 'Font family is required'),
    headingFontFamily: z.string().optional(),
    headingSize: z.enum(['small', 'medium', 'large', 'extra-large']),
    bodySize: z.enum(['small', 'medium', 'large']),
    fontWeight: z.enum(['light', 'normal', 'medium', 'bold']),
    lineHeight: z.string().optional(),
    letterSpacing: z.string().optional(),
});

export const menuItemSchema = z.object({
    label: z.string().min(1, 'Label is required'),
    url: z.string().min(1, 'URL is required'),
});

export const storeSettingsSchema = z.object({
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
    colorPalette: z.array(z.string()).min(1, 'At least one color is required'),
    logo_url: z.string().url().optional().or(z.literal('')).or(z.null()),
    typography: typographySchema.optional(),
    components: z.array(z.any()).optional(),
    componentContent: z.record(z.any()).optional(),
});

export const validateStoreSettings = (settings) => {
    try {
        storeSettingsSchema.parse(settings);
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            };
        }
        return { success: false, errors: [{ message: 'An unknown validation error occurred' }] };
    }
};
