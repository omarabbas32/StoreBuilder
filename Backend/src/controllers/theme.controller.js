const { asyncHandler } = require('../middleware/errorHandler');

class ThemeController {
    constructor(themeService) {
        this.themeService = themeService;
    }

    getAll = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        const result = await this.themeService.getActiveThemes(userId);
        res.status(200).json({ success: true, data: result });
    });

    adminGetAll = asyncHandler(async (req, res) => {
        const result = await this.themeService.getAllThemes(req.query);
        res.status(200).json({ success: true, data: result });
    });

    create = asyncHandler(async (req, res) => {
        const result = await this.themeService.createTheme(req.body);
        res.status(201).json({ success: true, data: result });
    });

    createTemplate = asyncHandler(async (req, res) => {
        const result = await this.themeService.createUserTemplate(req.body, req.user.id);
        res.status(201).json({ success: true, data: result });
    });

    update = asyncHandler(async (req, res) => {
        const isAdmin = req.user.role === 'admin';
        const result = await this.themeService.updateTheme(req.params.id, req.body, req.user.id, isAdmin);
        res.status(200).json({ success: true, data: result });
    });

    delete = asyncHandler(async (req, res) => {
        const isAdmin = req.user.role === 'admin';
        await this.themeService.deleteTheme(req.params.id, req.user.id, isAdmin);
        res.status(200).json({ success: true, message: 'Theme deleted successfully' });
    });
}

module.exports = ThemeController;
