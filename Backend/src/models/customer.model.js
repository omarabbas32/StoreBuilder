const prisma = require('../db/prismaClient');

/**
 * CustomerModel - Pure data access layer for Customer
 * RULES:
 * - Only CRUD operations
 */
class CustomerModel {
    async findById(id) {
        return prisma.customer.findUnique({
            where: { id }
        });
    }

    async findByUserId(userId) {
        return prisma.customer.findFirst({
            where: { user_id: userId }
        });
    }

    async create(data) {
        return prisma.customer.create({
            data
        });
    }

    async update(id, data) {
        return prisma.customer.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.customer.delete({
            where: { id }
        });
    }
}

module.exports = new CustomerModel();
