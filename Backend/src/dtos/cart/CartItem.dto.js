/**
 * CartItemDTO
 * Response DTO for individual cart item
 */
class CartItemDTO {
    constructor(cartItem) {
        this.id = cartItem.id;
        this.productId = cartItem.product_id;
        this.productName = cartItem.product?.name;
        this.quantity = cartItem.quantity;
        this.price = parseFloat(cartItem.product?.price || 0);
        this.images = cartItem.product?.images || [];
        this.stock = cartItem.product?.stock || 0;
        this.subtotal = this.quantity * this.price;
    }
}

module.exports = CartItemDTO;
