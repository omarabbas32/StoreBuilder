const prisma = require('../db/prismaClient');

/**
 * UserModel - Pure data access layer for User
 * RULES:
 * - Only CRUD operations
 * - No password hashing
 * - No token generation logic
 */
class UserModel {
    async findById(id) {
        return prisma.user.findUnique({
            where: { id }
        });
    }

    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async findByResetToken(token) {
        return prisma.user.findFirst({
            where: {
                reset_token: token,
                reset_expires: {
                    gt: new Date()
                }
            }
        });
    }

    async findByVerificationToken(token) {
        return prisma.user.findFirst({
            where: { verification_token: token }
        });
    }

    async create(data) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                is_verified: true,
                created_at: true
            }
        });
    }

    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.user.delete({
            where: { id }
        });
    }
}

module.exports = new UserModel();
