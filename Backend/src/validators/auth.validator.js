const { z } = require('zod');

/**
 * Auth Validation Schemas
 */

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['customer', 'merchant', 'admin']).optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const resetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(6)
});

module.exports = {
    registerSchema,
    loginSchema,
    resetPasswordSchema
};
