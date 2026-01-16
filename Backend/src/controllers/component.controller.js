const ComponentService = require('../services/component.service');
const response = require('../utils/response');

class ComponentController {
    async getActive(req, res, next) {
        try {
            const components = await ComponentService.getActiveComponents();
            return response.success(res, components);
        } catch (error) {
            next(error);
        }
    }

    async adminGetAll(req, res, next) {
        try {
            const components = await ComponentService.adminGetAllComponents();
            return response.success(res, components);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const component = await ComponentService.createComponent(req.body);
            return response.success(res, component, 'Component created successfully', 201);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ComponentController();
