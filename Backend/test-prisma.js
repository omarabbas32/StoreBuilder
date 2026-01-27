require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

try {
    const prisma = new PrismaClient({ adapter });
    console.log('Instantiated successfully with PG adapter. Connecting...');
    prisma.$connect().then(() => {
        console.log('Connected!');
        process.exit(0);
    }).catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
} catch (err) {
    console.error('Instantiation error:', err);
    process.exit(1);
}
