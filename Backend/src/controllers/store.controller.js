const StoreService = require('../services/store.service');
const response = require('../utils/response');

class StoreController {
    async create(req, res, next) {
        try {
            const ownerId = req.user?.id;
            if (!ownerId) return response.error(res, 'Unauthorized', 401);

            const storeData = { ...req.body, owner_id: ownerId };
            const store = await StoreService.createStore(storeData);
            return response.success(res, store, 'Store created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const ownerId = req.user?.id;
            if (!ownerId) {
                return response.error(res, 'Unauthorized', 401);
            }
            const stores = await StoreService.getStoresByOwner(ownerId);
            return response.success(res, stores);
        } catch (error) {
            next(error);
        }
    }

    async getByIdOrSlug(req, res, next) {
        try {
            const { id } = req.params;
            const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

            let store;
            if (isUuid) {
                store = await StoreService.getStoreById(id);
            } else {
                store = await StoreService.getStoreBySlug(id);
            }

            if (!store) return response.error(res, 'Store not found', 404);
            return response.success(res, store);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const ownerId = req.user?.id;
            const storeId = req.params.id;

            // Verify ownership
            const existingStore = await StoreService.getStoreById(storeId);
            if (!existingStore || existingStore.owner_id !== ownerId) {
                return response.error(res, 'Forbidden: You do not own this store', 403);
            }

            const store = await StoreService.updateStore(storeId, req.body);
            return response.success(res, store, 'Store updated successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new StoreController();
