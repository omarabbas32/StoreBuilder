require('dotenv').config();
const prisma = require('../db/prismaClient');

console.log('--- TEST START ---');

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected!');

        const storeId = 'ca2c95a0-ca56-43aa-8e9a-06984f0036d3';

        console.log('Performing test query...');
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        console.log('Store found:', store ? store.name : 'NOT FOUND');

        if (!store) {
            console.log('Cannot proceed without a valid store ID.');
            return;
        }

        console.log('Attempting to create order...');
        const order = await prisma.order.create({
            data: {
                store_id: storeId,
                total_amount: 10.50,
                status: 'pending',
                customer_name: 'Debug Test',
                customer_email: 'debug@test.com',
                customer_phone: '0000',
                shipping_address: 'Debug Address'
            }
        });
        console.log('Created order:', order.id);

        await prisma.order.delete({ where: { id: order.id } });
        console.log('Cleaned up.');

    } catch (e) {
        console.error('--- ERROR DETECTED ---');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
