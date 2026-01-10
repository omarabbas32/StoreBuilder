const Store = require('../models/Store');
const { NotFoundError } = require('../utils/errors');

class StoreService {
    async createStore(data) {
        return await Store.create(data);
    }

    async getStoreBySlug(slug) {
        const store = await Store.findBySlug(slug);
        if (!store) throw new NotFoundError('Store not found');
        return store;
    }

    async getAllStores() {
        return await Store.findAll();
    }

    async getStoresByOwner(ownerId) {
        return await Store.findByOwner(ownerId);
    }

    async getStoreById(id) {
        const store = await Store.findById(id);
        if (!store) throw new NotFoundError('Store not found');
        return store;
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
