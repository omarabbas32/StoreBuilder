const Store = require('../models/Store');

class StoreService {
    async createStore(data) {
        return await Store.create(data);
    }

    async getStoreBySlug(slug) {
        return await Store.findBySlug(slug);
    }

    async getAllStores() {
        return await Store.findAll();
    }

    async getStoresByOwner(ownerId) {
        return await Store.findByOwner(ownerId);
    }

    async getStoreById(id) {
        return await Store.findById(id);
    }

    async updateStore(id, data) {
        // Basic implementation placeholder
        return await Store.update(id, data);
    }

    async deleteStore(id) {
        return await Store.delete(id);
    }
}

module.exports = new StoreService();
