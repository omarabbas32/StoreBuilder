/**
 * ReviewResponseDTO
 */
class ReviewResponseDTO {
    constructor(review) {
        this.id = review.id;
        this.productId = review.product_id;
        this.product_id = review.product_id;
        this.storeId = review.store_id;
        this.store_id = review.store_id;
        this.customerId = review.customer_id;
        this.customer_id = review.customer_id;
        this.orderId = review.order_id;
        this.order_id = review.order_id;
        this.rating = review.rating;
        this.title = review.title;
        this.comment = review.comment;
        this.images = review.images;
        this.status = review.status;
        this.helpfulCount = review.helpful_count || 0;
        this.helpful_count = review.helpful_count || 0;
        this.isVerifiedPurchase = review.is_verified_purchase || false;
        this.is_verified_purchase = review.is_verified_purchase || false;
        this.ownerResponse = review.owner_response;
        this.owner_response = review.owner_response;
        this.ownerResponseAt = review.owner_response_at;
        this.owner_response_at = review.owner_response_at;
        this.createdAt = review.created_at;
        this.created_at = review.created_at;

        if (review.customer) {
            const customerName = review.customer.user?.name || 'Customer';
            this.customerName = customerName;
            this.userName = customerName;
            this.user_name = customerName;
        } else {
            this.customerName = 'Verified Buyer';
            this.userName = 'Verified Buyer';
            this.user_name = 'Verified Buyer';
        }
    }

    static fromArray(reviews) {
        return reviews.map(rev => new ReviewResponseDTO(rev));
    }
}

module.exports = ReviewResponseDTO;
