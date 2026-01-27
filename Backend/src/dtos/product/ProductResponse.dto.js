/**
 * ProductResponseDTO
 * Response DTO for product
 */
class ProductResponseDTO {
    constructor(product) {
        this.id = product.id;
        this.storeId = product.store_id;
        this.name = product.name;
        this.description = product.description;
        this.price = parseFloat(product.price);
        this.stock = product.stock;
        this.categoryId = product.category_id;
        this.images = product.images || [];
        this.sortOrder = product.sort_order;
        this.createdAt = product.created_at;
        this.updatedAt = product.updated_at;
    }

    static fromArray(products) {
        return products.map(product => new ProductResponseDTO(product));
    }
}

module.exports = ProductResponseDTO;
