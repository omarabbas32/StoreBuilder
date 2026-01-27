const prisma = require('../db/prismaClient');

/**
 * CartItemModel - Pure data access layer for CartItem
 * RULES:
 * - Only CRUD operations
 * - No business logic
 * - No automatic quantity merging
 */
class CartItemModel {
    async findById(id) {
        return prisma.cartItem.findUnique({
            where: { id }
        });
    }

    async findByCartAndProduct(cartId, productId) {
        return prisma.cartItem.findFirst({
            where: {
                cart_id: cartId,
                product_id: productId
            }
        });
    }

    async findByCartId(cartId, includeProduct = false) {
        return prisma.cartItem.findMany({
            where: { cart_id: cartId },
            ...(includeProduct && {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            images: true,
                            stock: true
                        }
                    }
                }
            })
        });
    }

    async create(data) {
        return prisma.cartItem.create({
            data
        });
    }

    async update(id, data) {
        return prisma.cartItem.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return prisma.cartItem.delete({
            where: { id }
        });
    }

    async deleteMany(where) {
        return prisma.cartItem.deleteMany({
            where
        });
    }
}

module.exports = new CartItemModel();
