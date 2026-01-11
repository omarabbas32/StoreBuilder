const Category = require('../models/Category');

class CategoryService {
    async createCategory(data) {
        return await Category.create(data);
    }

    async getAllCategories() {
        return await Category.findAll();
    }

    async getCategoriesByStore(storeId) {
        return await Category.findByStore(storeId);
    }

    async getCategoryById(id) {
        return await Category.findById(id);
    }

    async deleteCategory(id) {
        return await Category.delete(id);
    }
}

module.exports = new CategoryService();
