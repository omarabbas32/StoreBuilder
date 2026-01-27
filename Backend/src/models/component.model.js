const prisma = require('../db/prismaClient');

/**
 * ComponentModel - Pure data access layer for Component
 */
class ComponentModel {
    async findById(id) {
        return prisma.component.findUnique({
            where: { id }
        });
    }

    async findMany(where = {}, options = {}) {
        const { orderBy, take, skip } = options;
        return prisma.component.findMany({
            where,
            ...(orderBy && { orderBy }),
            ...(take && { take: parseInt(take) }),
            ...(skip && { skip: parseInt(skip) })
        });
    }

    async create(data) {
        return prisma.component.create({
            data
        });
    }

    async update(id, data) {
        return prisma.component.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.component.delete({
            where: { id }
        });
    }
}

module.exports = new ComponentModel();
