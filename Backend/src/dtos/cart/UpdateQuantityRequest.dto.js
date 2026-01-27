/**
 * UpdateQuantityRequestDTO
 * Request DTO for updating cart item quantity
 */
class UpdateQuantityRequestDTO {
    constructor(data) {
        this.productId = data.productId;
        this.quantity = data.quantity;
    }

    static fromRequest(body) {
        return new UpdateQuantityRequestDTO({
            productId: body.productId,
            quantity: parseInt(body.quantity)
        });
    }
}

module.exports = UpdateQuantityRequestDTO;
