/**
 * UpdateStoreRequestDTO
 */
class UpdateStoreRequestDTO {
    constructor(data) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.tagline = data.tagline;
        this.business_hours = data.business_hours;
        this.contact_email = data.contact_email;
        this.contact_phone = data.contact_phone;
        this.address = data.address;
        this.facebook_url = data.facebook_url;
        this.instagram_url = data.instagram_url;
        this.twitter_url = data.twitter_url;
        this.linkedin_url = data.linkedin_url;
        this.tiktok_url = data.tiktok_url;
        this.settings = data.settings;
    }

    static fromRequest(body) {
        return new UpdateStoreRequestDTO({
            name: body.name,
            slug: body.slug,
            description: body.description,
            tagline: body.tagline,
            business_hours: body.business_hours,
            contact_email: body.contact_email,
            contact_phone: body.contact_phone,
            address: body.address,
            facebook_url: body.facebook_url,
            instagram_url: body.instagram_url,
            twitter_url: body.twitter_url,
            linkedin_url: body.linkedin_url,
            tiktok_url: body.tiktok_url,
            settings: body.settings
        });
    }
}

module.exports = UpdateStoreRequestDTO;
