const prisma = require('../db/prismaClient');

/**
 * ReviewHelpfulVoteModel - Pure data access layer for ReviewHelpfulVote
 * RULES:
 * - Only CRUD operations
 * - No duplicate checking logic (moved to service)
 */
class ReviewHelpfulVoteModel {
    async findByReviewAndIp(reviewId, ipAddress) {
        return prisma.reviewHelpfulVote.findUnique({
            where: {
                reviewId_ipAddress: {
                    reviewId: reviewId,
                    ipAddress: ipAddress
                }
            }
        });
    }

    async findByReview(reviewId) {
        return prisma.reviewHelpfulVote.findMany({
            where: { reviewId: reviewId }
        });
    }

    async create(data) {
        return prisma.reviewHelpfulVote.create({
            data
        });
    }

    async delete(reviewId, ipAddress) {
        return prisma.reviewHelpfulVote.delete({
            where: {
                reviewId_ipAddress: {
                    reviewId: reviewId,
                    ipAddress: ipAddress
                }
            }
        });
    }
}

module.exports = new ReviewHelpfulVoteModel();
