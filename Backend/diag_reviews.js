const prisma = require('./src/db/prismaClient');

async function check() {
    try {
        const reviews = await prisma.productReview.findMany({
            orderBy: { created_at: 'desc' },
            take: 5,
            include: {
                product: { select: { id: true, name: true } }
            }
        });
        console.log('--- RECENT REVIEWS ---');
        console.log(JSON.stringify(reviews, null, 2));

        const counts = await prisma.productReview.count();
        console.log('--- TOTAL REVIEWS ---');
        console.log(counts);
    } catch (err) {
        console.error('Error during check:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
