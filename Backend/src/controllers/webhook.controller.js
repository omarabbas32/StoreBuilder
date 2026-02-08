const { asyncHandler } = require('../middleware/errorHandler');

/**
 * WebhookController - HTTP handlers for webhook management
 */
class WebhookController {
    constructor({ webhookService }) {
        this.webhookService = webhookService;
    }

    /**
     * Create a new webhook subscription
     * POST /api/webhooks
     */
    create = asyncHandler(async (req, res) => {
        const storeId = req.user.storeId;
        const { url, events } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Webhook URL is required' });
        }

        const subscription = await this.webhookService.createSubscription(storeId, {
            url,
            events
        });

        res.status(201).json({
            message: 'Webhook subscription created successfully',
            data: subscription
        });
    });

    /**
     * Get all webhook subscriptions for a store
     * GET /api/webhooks
     */
    getAll = asyncHandler(async (req, res) => {
        const storeId = req.user.storeId;
        const subscriptions = await this.webhookService.getSubscriptions(storeId);

        res.json({
            data: subscriptions
        });
    });

    /**
     * Get a specific webhook subscription
     * GET /api/webhooks/:id
     */
    getOne = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const storeId = req.user.storeId;

        const subscription = await this.webhookService.getSubscriptionById(id, storeId);

        res.json({
            data: subscription
        });
    });

    /**
     * Update a webhook subscription
     * PUT /api/webhooks/:id
     */
    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const storeId = req.user.storeId;
        const { url, events, is_active } = req.body;

        const subscription = await this.webhookService.updateSubscription(id, storeId, {
            url,
            events,
            is_active
        });

        res.json({
            message: 'Webhook subscription updated successfully',
            data: subscription
        });
    });

    /**
     * Delete a webhook subscription
     * DELETE /api/webhooks/:id
     */
    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const storeId = req.user.storeId;

        await this.webhookService.deleteSubscription(id, storeId);

        res.json({
            message: 'Webhook subscription deleted successfully'
        });
    });

    /**
     * Regenerate webhook secret
     * POST /api/webhooks/:id/regenerate-secret
     */
    regenerateSecret = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const storeId = req.user.storeId;

        const result = await this.webhookService.regenerateSecret(id, storeId);

        res.json({
            message: 'Webhook secret regenerated successfully',
            data: result
        });
    });

    /**
     * Send a test webhook
     * POST /api/webhooks/:id/test
     */
    sendTest = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const storeId = req.user.storeId;

        const result = await this.webhookService.sendTest(id, storeId);

        res.json({
            message: 'Test webhook sent',
            data: result
        });
    });

    /**
     * Get webhook delivery logs
     * GET /api/webhooks/:id/logs
     */
    getLogs = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const storeId = req.user.storeId;
        const limit = parseInt(req.query.limit) || 50;

        const logs = await this.webhookService.getLogs(id, storeId, limit);

        res.json({
            data: logs
        });
    });
}

module.exports = WebhookController;
