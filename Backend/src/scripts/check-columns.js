require('dotenv').config();
const prisma = require('../db/prismaClient');

async function check() {
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'
        `;
        console.log('Current Orders columns:', columns.map(c => c.column_name));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
