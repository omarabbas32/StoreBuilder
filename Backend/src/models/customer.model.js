const prisma = require('../db/prismaClient');

/**
 * CustomerModel - Data access layer for Customer
 * RULES:
 * - Only CRUD operations
 * - Maps customer records to User table (since there's no separate Customer table)
 */
class CustomerModel {
    async findByUserId(userId) {
        return prisma.user.findUnique({
            where: { id: userId }
        });
    }

    async create(data) {
        const { user_id, phone, address } = data;
        return prisma.user.update({
            where: { id: user_id },
            data: {
                phone: phone || null,
                // Store address in metadata if needed
            }
        });
    }

    async findById(id) {
        return prisma.user.findUnique({
            where: { id }
        });
    }

    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data
        });
    }
}

module.exports = CustomerModel;
