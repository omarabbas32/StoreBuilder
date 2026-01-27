/**
 * StoreResponseDTO
 */
class StoreResponseDTO {
    constructor(store) {
        this.id = store.id;
        this.ownerId = store.owner_id;
        this.name = store.name;
        this.slug = store.slug;
        this.description = store.description;
        this.settings = store.settings;
        this.createdAt = store.created_at;
        this.updatedAt = store.updated_at;
    }

    static fromArray(stores) {
        return stores.map(store => new StoreResponseDTO(store));
    }
}

module.exports = StoreResponseDTO;
