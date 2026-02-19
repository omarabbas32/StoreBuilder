const prisma = require('./src/db/prismaClient');

async function testQuery() {
    try {
        const storeId = '74baa493-1af7-49fb-9cc0-a8121ad74fb5';
        console.log(`Testing Prisma Category Query for store: ${storeId}...`);
        const categories = await prisma.category.findMany({
            where: { store_id: storeId }
        });
        console.log('Total categories found:', categories.length);
        if (categories.length > 0) {
            console.log('Sample category object keys:', Object.keys(categories[0]));
            console.log('Sample category object:', JSON.stringify(categories[0], null, 2));
        }
    } catch (err) {
        console.error('Prisma query failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testQuery();
