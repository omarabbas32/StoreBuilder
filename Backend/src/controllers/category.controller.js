const CategoryService = require('../services/category.service');
const StoreService = require('../services/store.service');

class CategoryController {
    async create(req, res) {
        try {
            const { store_id } = req.body;
            const ownerId = req.user?.id;

            // Verify store ownership
            const store = await StoreService.getStoreById(store_id);
            if (!store || store.owner_id !== ownerId) {
                return res.status(403).json({ error: 'Forbidden: You do not own this store' });
            }

            const category = await CategoryService.createCategory(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const { store_id } = req.query;
            const ownerId = req.user?.id;

            if (store_id) {
                // If filtering by store, verify ownership for dashboard usage
                const store = await StoreService.getStoreById(store_id);
                if (store && store.owner_id !== ownerId) {
                    // For public listing, this might be okay, but for the dashboard it should be isolated.
                    // Assuming this endpoint is used by the dashboard.
                    return res.status(403).json({ error: 'Forbidden' });
                }
                const categories = await CategoryService.getCategoriesByStore(store_id);
                return res.json(categories);
            }

            const categories = await CategoryService.getAllCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            if (!category) return res.status(404).json({ error: 'Category not found' });
            res.json(category);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CategoryController();
