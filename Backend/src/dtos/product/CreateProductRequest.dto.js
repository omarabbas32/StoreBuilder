/**
 * CreateProductRequestDTO
 * Request DTO for creating a product
 */
class CreateProductRequestDTO {
    constructor(data) {
        this.storeId = data.storeId;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.stock = data.stock;
        this.categoryId = data.categoryId;
        this.images = data.images || [];
    }

    static fromRequest(body) {
        return new CreateProductRequestDTO({
            storeId: body.storeId || body.store_id,
            name: body.name,
            description: body.description,
            price: parseFloat(body.price),
            stock: parseInt(body.stock) || 0,
            categoryId: body.categoryId || body.category_id,
            images: Array.isArray(body.images) ? body.images : []
        });
    }
}

module.exports = CreateProductRequestDTO;
