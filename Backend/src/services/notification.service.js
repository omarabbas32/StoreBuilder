const AppError = require('../utils/AppError');

class NotificationService {
    constructor({ prisma, webhookService }) {
        this.prisma = prisma;
        this.webhookService = webhookService;
        console.log('[DEBUG_NOTIFICATION_SERVICE] Prisma models:', Object.keys(this.prisma || {}).filter(k => !k.startsWith('$')));
    }

    /**
     * Create notification and trigger webhooks
     */
    async createNotification(storeId, { type, title, message, metadata = {} }) {
        // Create the notification
        const notification = await this.prisma.notification.create({
            data: {
                store_id: storeId,
                type,
                title,
                message,
                metadata: metadata || {}
            }
        });

        // Trigger webhook event for the notification
        if (this.webhookService) {
            try {
                await this.webhookService.trigger(storeId, `notification.${type}`, {
                    notification_id: notification.id,
                    type,
                    title,
                    message,
                    metadata
                });
            } catch (error) {
                console.error('[Notification] Failed to trigger webhook:', error.message);
                // Don't fail the notification creation if webhook fails
            }
        }

        return notification;
    }

    async getNotifications(storeId, limit = 20) {
        console.log('[DEBUG_NOTIFICATION_SERVICE] getNotifications:', { storeId, hasNotificationModel: !!this.prisma?.notification });
        return await this.prisma.notification.findMany({
            where: { store_id: storeId },
            orderBy: { created_at: 'desc' },
            take: limit
        });
    }

    async getUnreadCount(storeId) {
        return await this.prisma.notification.count({
            where: {
                store_id: storeId,
                is_read: false
            }
        });
    }

    async markAsRead(id, storeId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, store_id: storeId }
        });

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        return await this.prisma.notification.update({
            where: { id },
            data: { is_read: true }
        });
    }

    async markAllAsRead(storeId) {
        return await this.prisma.notification.updateMany({
            where: { store_id: storeId, is_read: false },
            data: { is_read: true }
        });
    }

    async deleteNotification(id, storeId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, store_id: storeId }
        });

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        return await this.prisma.notification.delete({
            where: { id }
        });
    }

    /**
     * Handle webhook events and create notifications
     */
    async handleWebhookEvent(storeId, event, data) {
        const notificationMap = {
            'order.created': {
                type: 'order',
                title: 'New Order Received',
                message: `Order #${data.order_id || data.id} has been created`
            },
            'stock.low': {
                type: 'inventory',
                title: 'Low Stock Alert',
                message: `${data.product_name || 'Product'} is running low on stock`
            },
            'order.completed': {
                type: 'order',
                title: 'Order Completed',
                message: `Order #${data.order_id || data.id} has been completed`
            },
            'payment.received': {
                type: 'payment',
                title: 'Payment Received',
                message: `Payment of ${data.amount} received`
            }
        };

        const notificationData = notificationMap[event];

        if (notificationData) {
            return await this.createNotification(storeId, {
                ...notificationData,
                metadata: data
            });
        }
    }
}

module.exports = NotificationService;