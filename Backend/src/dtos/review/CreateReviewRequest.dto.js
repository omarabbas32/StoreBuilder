/**
 * CreateReviewRequestDTO
 */
class CreateReviewRequestDTO {
    constructor(data) {
        this.productId = data.productId || data.product_id;
        this.orderId = data.orderId || data.order_id;
        this.rating = data.rating;
        this.title = data.title;
        this.comment = data.comment;
        this.images = data.images || [];
    }

    static fromRequest(body) {
        if (!body) {
            throw new Error('Request body cannot be null or undefined');
        }
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
