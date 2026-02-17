const prisma = require('./src/db/prismaClient');

async function check() {
    const components = await prisma.component.findMany();
    console.log(JSON.stringify(components, null, 2));
    process.exit(0);
}

check();
