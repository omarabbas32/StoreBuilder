const prisma = require('../config/prisma');

async function main() {
    try {
        console.log('Testing Prisma connection...');
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        console.log('\nTesting User model...');
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        console.log('\nTesting Store model...');
        const storeCount = await prisma.store.count();
        console.log(`Store count: ${storeCount}`);

        console.log('\nTesting Product model with relations...');
        const products = await prisma.product.findMany({
            take: 1,
            include: {
                store: true,
                category: true
            }
        });
        console.log(`Found ${products.length} products.`);
        if (products.length > 0) {
            console.log(`First product: ${products[0].name} (Store: ${products[0].store?.name})`);
        }

        console.log('\nPrisma tests completed successfully.');
    } catch (error) {
        console.error('Prisma test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
