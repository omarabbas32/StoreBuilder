const prisma = require('./src/db/prismaClient');

async function checkReviews() {
    console.log('Checking ProductReviews in DB...');
    try {
        const count = await prisma.productReview.count();
        console.log(`Total Reviews: ${count}`);

        const reviews = await prisma.productReview.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        console.log('Recent Reviews:');
        console.dir(reviews, { depth: null });
    } catch (error) {
        console.error('Error querying DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkReviews();
