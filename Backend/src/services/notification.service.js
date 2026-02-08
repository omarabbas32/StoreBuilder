const AppError = require('../utils/AppError');

class NotificationService {
    constructor({ prisma }) {
        this.prisma = prisma;
    }

    async createNotification(storeId, { type, title, message, metadata = {} }) {
        return await this.prisma.notification.create({
            data: {
                store_id: storeId,
                type,
                title,
                message,
                metadata: metadata || {}
            }
        });
    }

    async getNotifications(storeId, limit = 20) {
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
}

module.exports = NotificationService;
