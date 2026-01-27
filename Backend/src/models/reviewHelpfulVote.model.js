const prisma = require('../db/prismaClient');

/**
 * ReviewHelpfulVoteModel - Pure data access layer for ReviewHelpfulVote
 * RULES:
 * - Only CRUD operations
 * - No duplicate checking logic (moved to service)
 */
class ReviewHelpfulVoteModel {
    async findByReviewAndCustomer(reviewId, customerId) {
        return prisma.reviewHelpfulVote.findUnique({
            where: {
                review_id_customer_id: {
                    review_id: reviewId,
                    customer_id: customerId
                }
            }
        });
    }

    async findByReview(reviewId) {
        return prisma.reviewHelpfulVote.findMany({
            where: { review_id: reviewId }
        });
    }

    async create(data) {
        return prisma.reviewHelpfulVote.create({
            data
        });
    }

    async delete(reviewId, customerId) {
        return prisma.reviewHelpfulVote.delete({
            where: {
                review_id_customer_id: {
                    review_id: reviewId,
                    customer_id: customerId
                }
            }
        });
    }
}

module.exports = new ReviewHelpfulVoteModel();
