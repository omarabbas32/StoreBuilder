const prisma = require('./src/db/prismaClient');

async function check() {
    try {
        const products = await prisma.product.findMany({
            where: {
                name: { contains: 'Hodie', mode: 'insensitive' }
            },
            select: { id: true, name: true, store_id: true }
        });
        // Wait, I missed the slug again. I don't see a slug field in schema.prisma for products!
        // Let me check schema.prisma again.
        console.log('--- HODIE PRODUCTS ---');
        console.log(JSON.stringify(products, null, 2));
    } catch (err) {
        console.error('Error during check:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
