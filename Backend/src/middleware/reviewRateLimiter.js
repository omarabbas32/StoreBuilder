const prisma = require('../db/prismaClient');

/**
 * IP-based rate limiter for anonymous reviews
 * Limits: 2 reviews per day per IP address
 */
const reviewRateLimiter = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        // Count reviews from this IP today
        const reviewCount = await prisma.productReview.count({
            where: {
                ipAddress: ip,
                createdAt: {
                    gte: today
                }
            }
        });
// dont forget to change the limit to 2 again 
        if (reviewCount >= 100) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. You can only submit 2 reviews per day.',
                retryAfter: 'tomorrow'
            });
        }

        next();
    } catch (error) {
        console.error('[REVIEW_RATE_LIMITER] Error:', error);
        // If rate limiter fails, allow the request to proceed
        next();
    }
};

/**
 * Check for duplicate review (same IP + product)
 */
const duplicateReviewCheck = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const productId = req.body.product_id || req.body.productId;

    if (!productId) {
        return next(); // Let validator handle missing productId
    }

    try {
        const existingReview = await prisma.productReview.findFirst({
            where: {
                ipAddress: ip,
                productId: productId
            }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this product.'
            });
        }

        next();
    } catch (error) {
        console.error('[DUPLICATE_REVIEW_CHECK] Error:', error);
        // If check fails, allow the request to proceed
        next();
    }
};

module.exports = {
    reviewRateLimiter,
    duplicateReviewCheck
};
