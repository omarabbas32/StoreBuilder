const express = require('express');
const router = express.Router();

module.exports = (container) => {
    const webhookController = container.resolve('webhookController');
    const { authenticate, requireStore } = container.resolve('authMiddleware');

    // All routes require authentication and store ownership
    router.use(authenticate);
    router.use(requireStore);

    // CRUD routes
    router.post('/', webhookController.create);
    router.get('/', webhookController.getAll);
    router.get('/:id', webhookController.getOne);
    router.put('/:id', webhookController.update);
    router.delete('/:id', webhookController.delete);

    // Special actions
    router.post('/:id/regenerate-secret', webhookController.regenerateSecret);
    router.post('/:id/test', webhookController.sendTest);
    router.get('/:id/logs', webhookController.getLogs);

    return router;
};
