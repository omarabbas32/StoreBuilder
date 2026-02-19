const AppError = require('../utils/AppError');
const PaginationDTO = require('../dtos/common/Pagination.dto');

/**
 * ReviewService - Contains ALL review business logic
 * 
 * Business Rules:
 * - Customers can only review products they purchased
 * - One review per customer per product
 * - Store owners can respond to reviews
 * - Helpful votes must be unique per customer
 */
class ReviewService {
    constructor({ reviewModel, reviewHelpfulVoteModel, productModel, orderModel, storeModel, prisma }) {
        this.reviewModel = reviewModel;
        this.reviewHelpfulVoteModel = reviewHelpfulVoteModel;
        this.productModel = productModel;
        this.orderModel = orderModel;
        this.storeModel = storeModel;
        this.prisma = prisma;
    }

    /**
     * Resolve User ID to Customer ID
     */
    async _resolveCustomerId(userId) {
        if (!userId) return null;
        const customer = await this.prisma.customer.findFirst({
            where: { user_id: userId }
        });
        return customer ? customer.id : null;
    }

    /**
     * Create review
     * Business Rules:
     * - Product must exist
     * - Customer should have purchased the product
     * - One review per customer per product
     */
    async createReview(dto, userId) {
        const { productId, rating, title, comment, images, orderId } = dto;
        const customerId = await this._resolveCustomerId(userId);

        if (!customerId) {
            throw new AppError('Customer profile not found. Please ensure you are logged in correctly.', 401);
        }

        // Business Rule 1: Product must exist
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Business Rule 2: Validate rating
        const numericRating = parseInt(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            throw new AppError('Rating must be between 1 and 5', 400);
        }

        // Business Rule 3: STRICT Enforcement - Only verified purchasers can review
        // Check for ANY completed/delivered order by this customer that contains this product
        const purchaseRecord = await this.prisma.order.findFirst({
            where: {
                customer_id: customerId,
                status: {
                    in: ['delivered', 'completed', 'paid']
                },
                order_items: {
                    some: {
                        product_id: productId
                    }
                }
            },
            select: { id: true }
        });

        if (!purchaseRecord) {
            throw new AppError('Only customers who have purchased this product can leave a review.', 403);
        }

        const isVerifiedEntry = true;
        const finalOrderId = orderId || purchaseRecord.id;

        // Create review
        const review = await this.reviewModel.create({
            product_id: productId,
            store_id: product.store_id || null,
            customer_id: customerId,
            order_id: isVerifiedEntry ? finalOrderId : null,
            rating: numericRating,
            title: title.trim(),
            comment: comment.trim(),
            images: images || [],
            status: 'approved', // Auto-approve for now
            is_verified_purchase: isVerifiedEntry
        });

        // Recalculate product rating stats
        await this.syncProductRating(productId);

        return review;
    }

    /**
     * Recalculate and sync product rating statistics
     */
    async syncProductRating(productId) {
        const reviews = await this.prisma.productReview.findMany({
            where: { product_id: productId, status: 'approved' },
            select: { rating: true }
        });

        const count = reviews.length;
        const avg = count > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / count
            : 0;

        await this.productModel.update(productId, {
            average_rating: avg,
            reviews_count: count
        });
    }

    /**
     * Get reviews by product
     */
    async getProductReviews(productId, options = {}) {
        const { page = 1, limit = 20, status = 'approved' } = options;
        const offset = (page - 1) * limit;

        const reviews = await this.reviewModel.findByProduct(productId, {
            limit,
            offset,
            status
        });

        const total = await this.reviewModel.countByProduct(productId, status);

        return new PaginationDTO(reviews, total, page, limit);
    }

    /**
     * Get reviews by store
     */
    async getStoreReviews(storeId, options = {}) {
        const { page = 1, limit = 20, status = null } = options;
        const offset = (page - 1) * limit;

        const reviews = await this.reviewModel.findByStore(storeId, {
            limit,
            offset,
            status
        });

        const total = await this.reviewModel.countByStore(storeId, status);

        return new PaginationDTO(reviews, total, page, limit);
    }

    /**
     * Get review by ID
     */
    async getReview(reviewId) {
        const review = await this.reviewModel.findById(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }
        return review;
    }

    /**
     * Update review status
     */
    async updateReviewStatus(reviewId, newStatus, ownerId) {
        const review = await this.reviewModel.findById(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Verify store ownership
        const store = await this.storeModel.findById(review.store_id);
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(newStatus)) {
            throw new AppError('Invalid status', 400);
        }

        const updated = await this.reviewModel.update(reviewId, { status: newStatus });
        return updated;
    }

    /**
     * Add owner response to review
     */
    async addOwnerResponse(reviewId, response, ownerId) {
        const review = await this.reviewModel.findById(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        const store = await this.storeModel.findById(review.store_id);
        if (store.owner_id !== ownerId) {
            throw new AppError('You do not own this store', 403);
        }

        const updated = await this.reviewModel.update(reviewId, {
            owner_response: response,
            owner_response_at: new Date()
        });

        return updated;
    }

    /**
     * Mark review as helpful
     */
    async markHelpful(reviewId, userId) {
        const customerId = await this._resolveCustomerId(userId);
        if (!customerId) {
            throw new AppError('Customer profile not found', 401);
        }

        const review = await this.reviewModel.findById(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        const existingVote = await this.reviewHelpfulVoteModel.findByReviewAndCustomer(
            reviewId,
            ipAddress
        );

        if (existingVote) {
            throw new AppError('You have already marked this review as helpful', 400);
        }

        await this.prisma.$transaction(async (tx) => {
            await this.reviewHelpfulVoteModel.create({
                review_id: reviewId,
                ip_address: ipAddress
            });

            await this.reviewModel.incrementHelpfulCount(reviewId);
        });

        return { success: true, message: 'Review marked as helpful' };
    }

    /**
     * Delete review
     */
    async deleteReview(reviewId, userId, isOwner = false) {
        const customerId = await this._resolveCustomerId(userId);
        const review = await this.reviewModel.findById(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        if (!isOwner && review.customer_id !== customerId) {
            throw new AppError('You can only delete your own reviews', 403);
        }

        await this.reviewModel.delete(reviewId);
        return { success: true, message: 'Review deleted successfully' };
    }

    /**
     * Check if a customer can review a product
     */
    async checkReviewEligibility(productId, userId) {
        const customerId = await this._resolveCustomerId(userId);

        if (!customerId) {
            return { eligible: false, reason: 'Customer profile not found. Only registered customers can leave reviews.' };
        }

        // 1. Check if already reviewed
        const existingReview = await this.prisma.productReview.findFirst({
            where: { product_id: productId, customer_id: customerId }
        });

        if (existingReview) {
            return { eligible: false, reason: 'You have already reviewed this product.' };
        }

        // 2. Check if purchased at all (any status)
        const anyPurchase = await this.prisma.order.findFirst({
            where: {
                customer_id: customerId,
                order_items: { some: { product_id: productId } }
            }
        });

        if (!anyPurchase) {
            return { eligible: false, reason: 'Only customers who have purchased this product can leave a review.' };
        }

        // 3. Check if order is in a "reviewable" status
        const eligiblePurchase = await this.prisma.order.findFirst({
            where: {
                customer_id: customerId,
                status: { in: ['delivered', 'completed', 'paid'] },
                order_items: { some: { product_id: productId } }
            }
        });

        if (!eligiblePurchase) {
            return { eligible: false, reason: 'You can leave a review once your order is delivered.' };
        }

        return { eligible: true };
    }
}

module.exports = ReviewService;
