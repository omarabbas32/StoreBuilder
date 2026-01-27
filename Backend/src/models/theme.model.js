const prisma = require('../db/prismaClient');

/**
 * ThemeModel - Pure data access layer for Theme
 */
class ThemeModel {
    async findById(id) {
        return prisma.theme.findUnique({
            where: { id }
        });
    }

    async findMany(where = {}, options = {}) {
        const { orderBy, take, skip } = options;
        return prisma.theme.findMany({
            where,
            ...(orderBy && { orderBy }),
            ...(take && { take: parseInt(take) }),
            ...(skip && { skip: parseInt(skip) })
        });
    }

    async create(data) {
        return prisma.theme.create({
            data
        });
    }

    async update(id, data) {
        return prisma.theme.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.theme.delete({
            where: { id }
        });
    }
}

module.exports = new ThemeModel();
