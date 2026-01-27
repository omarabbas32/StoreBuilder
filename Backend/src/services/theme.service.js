const AppError = require('../utils/AppError');

/**
 * ThemeService - Contains ALL theme business logic
 * 
 * Business Rules:
 * - Themes can be global or user-specific
 * - Only active themes are shown to users
 * - Users can create custom templates
 */
class ThemeService {
    constructor({ themeModel, userModel }) {
        this.themeModel = themeModel;
        this.userModel = userModel;
    }

    /**
     * Get all active themes
     * For user theme selection
     */
    async getActiveThemes(userId = null) {
        // Implementation depends on Theme model's findActive method
        // This would need to be implemented in theme.model.js
        return await this.themeModel.findMany(
            { is_active: true },
            { orderBy: { name: 'asc' } }
        );
    }

    /**
     * Get all themes (admin)
     */
    async getAllThemes(options = {}) {
        return await this.themeModel.findMany({}, options);
    }

    /**
     * Create theme (admin)
     */
    async createTheme(dto) {
        const theme = await this.themeModel.create({
            name: dto.name,
            description: dto.description || null,
            config: dto.config || {},
            preview_url: dto.previewUrl || null,
            is_active: dto.isActive ?? true,
            user_id: null // Global theme
        });

        return theme;
    }

    /**
     * Create custom template (user)
     * Business Rule: User can create their own themes
     */
    async createUserTemplate(dto, userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const theme = await this.themeModel.create({
            name: dto.name,
            description: dto.description || null,
            config: dto.config || {},
            preview_url: dto.previewUrl || null,
            is_active: true,
            user_id: userId
        });

        return theme;
    }

    /**
     * Update theme
     */
    async updateTheme(themeId, dto, userId = null, isAdmin = false) {
        const theme = await this.themeModel.findById(themeId);
        if (!theme) {
            throw new AppError('Theme not found', 404);
        }

        // Business Rule: Users can only edit their own themes, admins can edit all
        if (!isAdmin && theme.user_id !== userId) {
            throw new AppError('You do not have permission to edit this theme', 403);
        }

        const updated = await this.themeModel.update(themeId, dto);
        return updated;
    }

    /**
     * Delete theme
     */
    async deleteTheme(themeId, userId = null, isAdmin = false) {
        const theme = await this.themeModel.findById(themeId);
        if (!theme) {
            throw new AppError('Theme not found', 404);
        }

        if (!isAdmin && theme.user_id !== userId) {
            throw new AppError('You do not have permission to delete this theme', 403);
        }

        await this.themeModel.delete(themeId);
        return { success: true, message: 'Theme deleted successfully' };
    }

    /**
     * Get theme by ID
     */
    async getTheme(themeId) {
        const theme = await this.themeModel.findById(themeId);
        if (!theme) {
            throw new AppError('Theme not found', 404);
        }
        return theme;
    }
}

module.exports = ThemeService;
