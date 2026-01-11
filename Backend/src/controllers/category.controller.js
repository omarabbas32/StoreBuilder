const CategoryService = require('../services/category.service');
const StoreService = require('../services/store.service');

class CategoryController {
    async create(req, res, next) {
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
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            let { store_id } = req.query;

            // Multi-tenancy support: use tenant ID if store_id is not provided in query
            if (!store_id && req.tenant) {
                store_id = req.tenant;
            }

            let categories;
            if (store_id) {
                categories = await CategoryService.getCategoriesByStore(store_id);
            } else {
                categories = await CategoryService.getAllCategories();
            }
            res.json(categories);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            if (!category) return res.status(404).json({ error: 'Category not found' });
            res.json(category);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController();
