/**
 * UpdateStoreRequestDTO
 */
class UpdateStoreRequestDTO {
    constructor(data) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.settings = data.settings;
    }

    static fromRequest(body) {
        return new UpdateStoreRequestDTO({
            name: body.name,
            slug: body.slug,
            description: body.description,
            settings: body.settings
        });
    }
}

module.exports = UpdateStoreRequestDTO;
