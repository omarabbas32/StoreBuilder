/**
 * OrderResponseDTO
 * Response DTO for order
 */
class OrderResponseDTO {
    constructor(order) {
        this.id = order.id;
        this.storeId = order.store_id;
        this.customerId = order.customer_id;
        this.totalAmount = parseFloat(order.total_amount);
        this.status = order.status;
        this.customerName = order.customer_name;
        this.customerEmail = order.customer_email;
        this.customerPhone = order.customer_phone;
        this.shippingAddress = order.shipping_address;
        this.notes = order.notes;
        this.createdAt = order.created_at;
        this.updatedAt = order.updated_at;

        if (order.order_items) {
            this.items = order.order_items.map(item => ({
                id: item.id,
                productId: item.product_id,
                productName: item.product?.name,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price)
            }));
        }
    }

    static fromArray(orders) {
        return orders.map(order => new OrderResponseDTO(order));
    }
}

module.exports = OrderResponseDTO;
