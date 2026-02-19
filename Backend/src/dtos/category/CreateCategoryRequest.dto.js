/**
 * CreateCategoryRequestDTO
 */
class CreateCategoryRequestDTO {
    constructor(data) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.image_url = data.image_url;
        this.storeId = data.storeId;
        this.parentId = data.parentId;
    }

    static fromRequest(body) {
        return new CreateCategoryRequestDTO({
            name: body.name,
            slug: body.slug,
            description: body.description,
            image_url: body.image_url || body.imageUrl,
            storeId: body.storeId || body.store_id,
            parentId: body.parentId || body.parent_id
        });
    }
}

module.exports = CreateCategoryRequestDTO;
