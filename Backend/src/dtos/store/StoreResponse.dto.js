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
        this.tagline = store.tagline;
        this.business_hours = store.business_hours;
        this.contact_email = store.contact_email;
        this.contact_phone = store.contact_phone;
        this.address = store.address;
        this.facebook_url = store.facebook_url;
        this.instagram_url = store.instagram_url;
        this.twitter_url = store.twitter_url;
        this.linkedin_url = store.linkedin_url;
        this.tiktok_url = store.tiktok_url;
        this.settings = store.settings;
        this.createdAt = store.created_at;
        this.updatedAt = store.updated_at;
    }

    static fromArray(stores) {
        return stores.map(store => new StoreResponseDTO(store));
    }
}

module.exports = StoreResponseDTO;
