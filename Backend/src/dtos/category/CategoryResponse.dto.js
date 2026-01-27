/**
 * CategoryResponseDTO
 */
class CategoryResponseDTO {
    constructor(category) {
        this.id = category.id;
        this.name = category.name;
        this.slug = category.slug;
        this.description = category.description;
        this.storeId = category.store_id;
        this.parentId = category.parent_id;
        this.createdAt = category.created_at;
    }

    static fromArray(categories) {
        return categories.map(cat => new CategoryResponseDTO(cat));
    }
}

module.exports = CategoryResponseDTO;
