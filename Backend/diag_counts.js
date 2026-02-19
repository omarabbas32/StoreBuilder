const prisma = require('./src/db/prismaClient');

async function check() {
    try {
        const product1 = await prisma.productReview.count({ where: { product_id: 'f4d6f8e2-cfee-453d-9709-2259e7e01987' } });
        const product2 = await prisma.productReview.count({ where: { product_id: '1196fe00-23c2-40cc-bc48-a2be65c267fb' } });

        console.log('--- REVIEW COUNTS ---');
        console.log('hodie (f4d6...):', product1);
        console.log('Hodie  (1196...):', product2);
    } catch (err) {
        console.error('Error during check:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
