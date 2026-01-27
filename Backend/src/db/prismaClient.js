require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Driver Adapter setup for Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

/**
 * Prisma Client initialization
 */
const prisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') {
    prisma.$connect()
        .then(() => console.log('[Prisma] Database connected'))
        .catch(err => console.error('[Prisma] Connection error:', err.message));
}

module.exports = prisma;
