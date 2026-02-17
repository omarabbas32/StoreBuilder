/**
 * ReviewResponseDTO
 */
class ReviewResponseDTO {
    constructor(review) {
        this.id = review.id;
        this.productId = review.productId;
        this.product_id = review.productId; // Include snake_case for frontend compatibility
        this.storeId = review.storeId;
        this.orderId = review.orderId;
        this.rating = review.rating;
        this.title = review.title;
        this.comment = review.comment;
        this.images = review.images;
        this.status = review.status;
        this.helpfulCount = review.helpfulCount;
        this.ownerResponse = review.ownerResponse;
        this.ownerResponseAt = review.ownerResponseAt;
        this.createdAt = review.createdAt;
        this.created_at = review.createdAt; // Include snake_case for frontend compatibility

        // All reviews are currently anonymous (IP-based)
        this.customerName = 'Anonymous';
        this.user_name = 'Anonymous';
    }

    static fromArray(reviews) {
        return reviews.map(rev => new ReviewResponseDTO(rev));
    }
}

module.exports = ReviewResponseDTO;
