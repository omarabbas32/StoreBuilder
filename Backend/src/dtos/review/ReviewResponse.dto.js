/**
 * ReviewResponseDTO
 */
class ReviewResponseDTO {
    constructor(review) {
        this.id = review.id;
        this.productId = review.product_id;
        this.product_id = review.product_id; // Include snake_case for frontend compatibility
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
        this.created_at = review.created_at; // Include snake_case for frontend compatibility

        if (review.customer) {
            const customerName = review.customer.user?.name || (review.customer.first_name + ' ' + review.customer.last_name);
            this.customerName = customerName;
            this.user_name = customerName; // Include snake_case for frontend compatibility
        } else {
            // Handle guest reviews (no customer record)
            this.customerName = 'Anonymous';
            this.user_name = 'Anonymous';
        }
    }

    static fromArray(reviews) {
        return reviews.map(rev => new ReviewResponseDTO(rev));
    }
}

module.exports = ReviewResponseDTO;
