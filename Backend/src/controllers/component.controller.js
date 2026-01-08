const ComponentService = require('../services/component.service');

class ComponentController {
    async getActive(req, res) {
        try {
            const components = await ComponentService.getActiveComponents();
            res.json(components);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async adminGetAll(req, res) {
        try {
            const components = await ComponentService.adminGetAllComponents();
            res.json(components);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const component = await ComponentService.createComponent(req.body);
            res.status(201).json(component);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new ComponentController();
