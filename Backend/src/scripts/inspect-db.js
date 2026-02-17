require('dotenv').config();
const prisma = require('../db/prismaClient');

async function inspectTable() {
    try {
        console.log('Listing all tables in public schema...');
        const tables = await prisma.$queryRaw`
            SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
        `;
        console.log('Tables:', tables.map(t => t.table_name));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

inspectTable();
