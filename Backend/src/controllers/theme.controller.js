const ThemeService = require('../services/theme.service');

class ThemeController {
    async getAll(req, res) {
        try {
            const themes = await ThemeService.getAllThemes();
            res.json(themes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async adminGetAll(req, res) {
        try {
            const themes = await ThemeService.adminGetAllThemes();
            res.json(themes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const theme = await ThemeService.createTheme(req.body);
            res.status(201).json(theme);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new ThemeController();
