const { z } = require('zod');

/**
 * Review Validation Schemas
 */

const createReviewSchema = z.object({
    productId: z.string().uuid(),
    orderId: z.string().uuid().optional().nullable(),
    rating: z.number().int().min(1).max(5),
    title: z.string().min(1).max(100),
    comment: z.string().min(1).max(1000),
    images: z.array(z.string().url()).optional()
});

module.exports = {
    createReviewSchema
};
