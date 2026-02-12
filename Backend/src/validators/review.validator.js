const { z } = require('zod');

/**
 * Review Validation Schemas
 */

const createReviewSchema = z.object({
    productId: z.string().uuid().optional(),
    product_id: z.string().uuid().optional(),
    orderId: z.string().uuid().optional().nullable(),
    order_id: z.string().uuid().optional().nullable(),
    rating: z.coerce.number().int().min(1).max(5), // Use coerce to handle string/number
    title: z.string().min(1).max(100),
    comment: z.string().min(1).max(1000),
    images: z.array(z.string().url()).optional()
}).refine(
    (data) => data.productId || data.product_id,
    { message: "productId or product_id is required", path: ["productId"] }
).transform((data) => ({
    ...data,
    productId: data.productId || data.product_id,
    orderId: data.orderId || data.order_id
}));

module.exports = {
    createReviewSchema
};
