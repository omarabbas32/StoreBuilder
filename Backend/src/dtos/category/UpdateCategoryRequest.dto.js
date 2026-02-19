/**
 * UpdateCategoryRequestDTO
 */
class UpdateCategoryRequestDTO {
    constructor(data) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.image_url = data.image_url !== undefined ? data.image_url : data.imageUrl;
        this.parentId = data.parentId || data.parent_id;
    }

    static fromRequest(body) {
        return new UpdateCategoryRequestDTO({
            name: body.name,
            slug: body.slug,
            description: body.description,
            image_url: body.image_url !== undefined ? body.image_url : body.imageUrl,
            parentId: body.parentId || body.parent_id
        });
    }

    /**
     * Map DTO to Prisma data object
     */
    toPrisma() {
        const data = {};
        if (this.name !== undefined) data.name = this.name;
        if (this.slug !== undefined) data.slug = this.slug;
        if (this.description !== undefined) data.description = this.description;
        if (this.image_url !== undefined) data.image_url = this.image_url;
        if (this.parentId !== undefined) data.parent_id = this.parentId;
        return data;
    }
}

module.exports = UpdateCategoryRequestDTO;
