const AnalyticsService = require('../services/analytics.service');
const StoreService = require('../services/store.service');

class AdminController {
    async getDashboard(req, res) {
        try {
            const stats = await AnalyticsService.getAdminStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async listAllStores(req, res) {
        try {
            const stores = await StoreService.getAllStores();
            res.json(stores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AdminController();
