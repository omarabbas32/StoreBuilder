/**
 * CreateReviewRequestDTO
 */
class CreateReviewRequestDTO {
    constructor(data) {
        this.productId = data.productId;
        this.orderId = data.orderId;
        this.rating = data.rating;
        this.title = data.title;
        this.comment = data.comment;
        this.images = data.images || [];
    }

    static fromRequest(body) {
        return new CreateReviewRequestDTO({
            productId: body.productId || body.product_id,
            orderId: body.orderId || body.order_id,
            rating: body.rating,
            title: body.title,
            comment: body.comment,
            images: body.images
        });
    }
}

module.exports = CreateReviewRequestDTO;
