/**
 * CreateOrderRequestDTO
 * Request DTO for creating an order
 */
class CreateOrderRequestDTO {
    constructor(data) {
        this.storeId = data.storeId;
        this.customerId = data.customerId;
        this.customerName = data.customerName;
        this.customerEmail = data.customerEmail;
        this.customerPhone = data.customerPhone;
        this.shippingAddress = data.shippingAddress;
        this.notes = data.notes;
        this.items = data.items || []; // Array of { productId, quantity }
    }

    static fromRequest(body) {
        return new CreateOrderRequestDTO({
            storeId: body.storeId || body.store_id,
            customerId: body.customerId || body.customer_id,
            customerName: body.customerName || body.customer_name,
            customerEmail: body.customerEmail || body.customer_email,
            customerPhone: body.customerPhone || body.customer_phone,
            shippingAddress: body.shippingAddress || body.shipping_address,
            notes: body.notes,
            items: body.items
        });
    }
}

module.exports = CreateOrderRequestDTO;
