const AppError = require('../utils/AppError');

/**
 * ComponentService - Contains ALL component business logic
 * 
 * Business Rules:
 * - Only active components are shown to users
 * - Components have JSON schema for content
 * - Admin-only management
 */
class ComponentService {
    constructor({ componentModel }) {
        this.componentModel = componentModel;
    }

    /**
     * Get active components (for store builders)
     */
    async getActiveComponents() {
        return await this.componentModel.findMany(
            { is_active: true },
            { orderBy: { name: 'asc' } }
        );
    }

    /**
     * Get all components (admin)
     */
    async getAllComponents(options = {}) {
        return await this.componentModel.findMany({}, options);
    }

    /**
     * Get component by ID
     */
    async getComponent(componentId) {
        const component = await this.componentModel.findById(componentId);
        if (!component) {
            throw new AppError('Component not found', 404);
        }
        return component;
    }

    /**
     * Create component (admin only)
     */
    async createComponent(dto) {
        const component = await this.componentModel.create({
            name: dto.name,
            type: dto.type,
            content_schema: dto.contentSchema || {},
            screenshot_url: dto.screenshotUrl || null,
            is_active: dto.isActive ?? true
        });

        return component;
    }

    /**
     * Update component (admin only)
     */
    async updateComponent(componentId, dto) {
        const component = await this.componentModel.findById(componentId);
        if (!component) {
            throw new AppError('Component not found', 404);
        }

        const updated = await this.componentModel.update(componentId, dto);
        return updated;
    }

    /**
     * Delete component (admin only)
     */
    async deleteComponent(componentId) {
        const component = await this.componentModel.findById(componentId);
        if (!component) {
            throw new AppError('Component not found', 404);
        }

        await this.componentModel.delete(componentId);
        return { success: true, message: 'Component deleted successfully' };
    }

    /**
     * Toggle component active status (admin only)
     */
    async toggleActive(componentId) {
        const component = await this.componentModel.findById(componentId);
        if (!component) {
            throw new AppError('Component not found', 404);
        }

        const updated = await this.componentModel.update(componentId, {
            is_active: !component.is_active
        });

        return updated;
    }
}

module.exports = ComponentService;
