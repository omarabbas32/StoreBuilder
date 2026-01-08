const Theme = require('../models/Theme');

class ThemeService {
    async getAllThemes() {
        return Theme.findActive();
    }

    async adminGetAllThemes() {
        return Theme.findAll();
    }

    async createTheme(data) {
        return Theme.create(data);
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
