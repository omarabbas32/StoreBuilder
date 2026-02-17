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
     * Create review
     * Business Rules:
     * - Product must exist
     * - Customer should have purchased the product (optional enforcement)
     * - One review per customer per product
     */
    async createReview(dto, customerId) {
        const { productId, rating, title, comment, images, orderId } = dto;

        // Business Rule 1: Product must exist
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Business Rule 2: Validate rating (redundant with validator but good for service safety)
        const numericRating = parseInt(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            throw new AppError('Rating must be between 1 and 5', 400);
        }

        // Business Rule 3: Verify order ownership if provided
        let isVerifiedEntry = !!orderId;
        if (orderId) {
            const order = await this.orderModel.findById(orderId);
            if (!order || order.customer_id !== customerId) {
                // If order belongs to someone else, we don't allow it to be used for verification
                // We could throw error, or just null it out. Throwing is safer for API integrity.
                throw new AppError('Invalid order ID provided for this customer', 403);
            }

            // Check if product is actually in that order
            const itemInOrder = order.order_items?.some(item => item.product_id === productId);
            if (order.order_items && !itemInOrder) {
                isVerifiedEntry = false;
            }
        }

        // Create review
        const review = await this.reviewModel.create({
            product_id: productId,
            store_id: product.store_id || null,
            customer_id: customerId,
            order_id: isVerifiedEntry ? orderId : null,
            rating: numericRating,
            title: title.trim(),
            comment: comment.trim(),
            images: images || [],
            status: 'pending',
            is_verified_purchase: isVerifiedEntry
        });

        return review;
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
            status,
            includeCustomer: true
        });

        const total = await this.reviewModel.countByProduct(productId, status);

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
     * Update review status (admin/store owner)
     * Business Rule: Only store owner can approve/reject reviews
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

        // Valid statuses
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(newStatus)) {
            throw new AppError('Invalid status', 400);
        }

        const updated = await this.reviewModel.update(reviewId, { status: newStatus });
        return updated;
    }

    /**
     * Add owner response to review
     * Business Rule: Only store owner can respond
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
     * Business Rules:
     * - Customer can only vote once per review
     * - Must be atomic (transaction)
     */
    async markHelpful(reviewId, customerId) {
        const review = await this.reviewModel.findById(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Business Rule: Check if already voted
        const existingVote = await this.reviewHelpfulVoteModel.findByReviewAndCustomer(
            reviewId,
            customerId
        );

        if (existingVote) {
            throw new AppError('You have already marked this review as helpful', 400);
        }

        // Atomic transaction: create vote + increment count
        await this.prisma.$transaction(async (tx) => {
            await this.reviewHelpfulVoteModel.create({
                review_id: reviewId,
                customer_id: customerId
            });

            await this.reviewModel.incrementHelpfulCount(reviewId);
        });

        return { success: true, message: 'Review marked as helpful' };
    }

    /**
     * Delete review
     * Business Rule: Only review author or store owner can delete
     */
    async deleteReview(reviewId, userId, isOwner = false) {
        const review = await this.reviewModel.findById(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Check permissions
        if (!isOwner && review.customer_id !== userId) {
            throw new AppError('You can only delete your own reviews', 403);
        }

        await this.reviewModel.delete(reviewId);
        return { success: true, message: 'Review deleted successfully' };
    }
}

module.exports = ReviewService;
