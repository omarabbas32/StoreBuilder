const StoreService = require('../services/store.service');

class StoreController {
    async create(req, res) {
        try {
            const ownerId = req.user?.id;
            if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

            const storeData = { ...req.body, owner_id: ownerId };
            const store = await StoreService.createStore(storeData);
            res.status(201).json(store);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            // Filter by owner if authenticated
            const ownerId = req.user?.id;
            if (!ownerId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const stores = await StoreService.getStoresByOwner(ownerId);
            res.json(stores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getByIdOrSlug(req, res) {
        try {
            const { id } = req.params;
            const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

            let store;
            if (isUuid) {
                store = await StoreService.getStoreById(id);
            } else {
                store = await StoreService.getStoreBySlug(id);
            }

            if (!store) return res.status(404).json({ error: 'Store not found' });
            res.json(store);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const ownerId = req.user?.id;
            const storeId = req.params.id;

            // Verify ownership
            const existingStore = await StoreService.getStoreById(storeId);
            if (!existingStore || existingStore.owner_id !== ownerId) {
                return res.status(403).json({ error: 'Forbidden: You do not own this store' });
            }

            const store = await StoreService.updateStore(storeId, req.body);
            res.json(store);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new StoreController();
