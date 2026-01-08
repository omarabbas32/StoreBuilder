const Component = require('../models/Component');

class ComponentService {
    async getActiveComponents() {
        return Component.findActive();
    }

    async adminGetAllComponents() {
        return Component.findAll();
    }

    async createComponent(data) {
        return Component.create(data);
    }

    async updateComponent(id, data) {
        return Component.update(id, data);
    }

    async deleteComponent(id) {
        return Component.delete(id);
    }
}

module.exports = new ComponentService();
