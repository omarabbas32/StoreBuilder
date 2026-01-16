const Theme = require('../models/Theme');

class ThemeService {
    async getAllThemes(userId = null) {
        return Theme.findActive(userId);
    }

    async adminGetAllThemes() {
        return Theme.findAll();
    }

    async createTheme(data) {
        return Theme.create(data);
    }

    async createTemplate(userId, data) {
        return Theme.create({
            ...data,
            user_id: userId,
            is_active: true
        });
    }

    async updateTheme(id, data) {
        // Basic implementation, for now just create logic
        return Theme.update(id, data);
    }

    async deleteTheme(id) {
        return Theme.delete(id);
    }
}

module.exports = new ThemeService();
