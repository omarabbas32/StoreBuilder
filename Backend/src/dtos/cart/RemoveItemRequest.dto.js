/**
 * RemoveItemRequestDTO
 * Request DTO for removing item from cart
 */
class RemoveItemRequestDTO {
    constructor(data) {
        this.productId = data.productId;
    }

    static fromRequest(params, query) {
        return new RemoveItemRequestDTO({
            productId: params.productId || query.productId
        });
    }
}

module.exports = RemoveItemRequestDTO;
