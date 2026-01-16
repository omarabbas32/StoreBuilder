const ThemeService = require('../services/theme.service');
const response = require('../utils/response');

class ThemeController {
    async getAll(req, res, next) {
        try {
            const userId = req.user?.id;
            const themes = await ThemeService.getAllThemes(userId);
            return response.success(res, themes);
        } catch (error) {
            next(error);
        }
    }

    async adminGetAll(req, res, next) {
        try {
            const themes = await ThemeService.adminGetAllThemes();
            return response.success(res, themes);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const theme = await ThemeService.createTheme(req.body);
            return response.success(res, theme, 'Theme created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async createTemplate(req, res, next) {
        try {
            const userId = req.user.id;
            const theme = await ThemeService.createTemplate(userId, req.body);
            return response.success(res, theme, 'Template saved successfully', 201);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ThemeController();
