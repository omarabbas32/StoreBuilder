const prisma = require('../db/prismaClient');

/**
 * CustomerModel - Data access layer for Customer
 * RULES:
 * - Only CRUD operations
 * - Maps to customers table in schema
 */
class CustomerModel {
    async findByUserId(userId) {
        return prisma.customer.findFirst({
            where: { user_id: userId }
        });
    }

    async create(data) {
        const { user_id, phone, address } = data;
        return prisma.customer.create({
            data: {
                user_id,
                phone: phone || null,
                address: typeof address === 'object' ? JSON.stringify(address) : (address || null)
            }
        });
    }

    async findById(id) {
        return prisma.customer.findUnique({
            where: { id }
        });
    }

    async update(id, data) {
        if (data.address && typeof data.address === 'object') {
            data.address = JSON.stringify(data.address);
        }
        return prisma.customer.update({
            where: { id },
            data
        });
    }
}

module.exports = new CustomerModel();
