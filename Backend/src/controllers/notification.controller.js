const { asyncHandler } = require('../middleware/errorHandler');

class NotificationController {
    constructor({ notificationService, storeService }) {
        this.notificationService = notificationService;
        this.storeService = storeService;
    }

    getAll = asyncHandler(async (req, res) => {
        const { storeId } = req.query;
        if (!storeId) {
            return res.status(400).json({ status: 'error', message: 'storeId is required' });
        }

        // Verify ownership
        await this.storeService.getById(storeId, req.user.id);

        const notifications = await this.notificationService.getNotifications(storeId);
        const unreadCount = await this.notificationService.getUnreadCount(storeId);

        res.status(200).json({
            status: 'success',
            data: {
                notifications,
                unreadCount
            }
        });
    });

    markAsRead = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { storeId } = req.body;

        if (!storeId) {
            return res.status(400).json({ status: 'error', message: 'storeId is required' });
        }

        // Verify ownership
        await this.storeService.getById(storeId, req.user.id);

        await this.notificationService.markAsRead(id, storeId);

        res.status(200).json({
            status: 'success',
            message: 'Notification marked as read'
        });
    });

    markAllAsRead = asyncHandler(async (req, res) => {
        const { storeId } = req.body;

        if (!storeId) {
            return res.status(400).json({ status: 'error', message: 'storeId is required' });
        }

        // Verify ownership
        await this.storeService.getById(storeId, req.user.id);

        await this.notificationService.markAllAsRead(storeId);

        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read'
        });
    });

    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { storeId } = req.query;

        if (!storeId) {
            return res.status(400).json({ status: 'error', message: 'storeId is required' });
        }

        // Verify ownership
        await this.storeService.getById(storeId, req.user.id);

        await this.notificationService.deleteNotification(id, storeId);

        res.status(200).json({
            status: 'success',
            message: 'Notification deleted'
        });
    });
}

module.exports = NotificationController;
