const prisma = require('./src/db/prismaClient');

async function main() {
    console.log('Prisma Models:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
