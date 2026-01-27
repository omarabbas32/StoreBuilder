/**
 * AddItemRequestDTO
 * Request DTO for adding item to cart
 */
class AddItemRequestDTO {
    constructor(data) {
        this.productId = data.productId;
        this.quantity = data.quantity ?? 1;
        this.storeId = data.storeId;
    }

    static fromRequest(body) {
        return new AddItemRequestDTO({
            productId: body.productId,
            quantity: parseInt(body.quantity) || 1,
            storeId: body.storeId
        });
    }
}

module.exports = AddItemRequestDTO;
