/**
 * ReviewResponseDTO
 */
class ReviewResponseDTO {
    constructor(review) {
        this.id = review.id;
        this.productId = review.product_id;
        this.storeId = review.store_id;
        this.customerId = review.customer_id;
        this.orderId = review.order_id;
        this.rating = review.rating;
        this.title = review.title;
        this.comment = review.comment;
        this.images = review.images;
        this.status = review.status;
        this.helpfulCount = review.helpful_count;
        this.ownerResponse = review.owner_response;
        this.ownerResponseAt = review.owner_response_at;
        this.createdAt = review.created_at;

        if (review.customer) {
            this.customerName = review.customer.user?.name || (review.customer.first_name + ' ' + review.customer.last_name);
        }
    }

    static fromArray(reviews) {
        return reviews.map(rev => new ReviewResponseDTO(rev));
    }
}

module.exports = ReviewResponseDTO;
