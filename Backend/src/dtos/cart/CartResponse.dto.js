const CartItemDTO = require('./CartItem.dto');

/**
 * CartResponseDTO
 * Response DTO for cart with items
 */
class CartResponseDTO {
    constructor(cart, items = []) {
        this.id = cart?.id || null;
        this.customerId = cart?.customer_id || null;
        this.sessionId = cart?.session_id || null;
        this.storeId = cart?.store_id || null;

        this.items = items.map(item => new CartItemDTO(item));

        this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        this.total = this.subtotal; // Can add tax/shipping later

        this.createdAt = cart?.created_at;
        this.updatedAt = cart?.updated_at;
    }

    static empty() {
        return new CartResponseDTO({ id: null }, []);
    }
}

module.exports = CartResponseDTO;
