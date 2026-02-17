const prisma = require('../src/db/prismaClient');

async function checkStore() {
    const storeId = 'ca2c95a0-ca56-43aa-8e9a-06984f0036d3';
    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: {
                name: true,
                settings: true
            }
        });

        console.log('--- Store Settings ---');
        console.log(JSON.stringify(store.settings, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

checkStore();
