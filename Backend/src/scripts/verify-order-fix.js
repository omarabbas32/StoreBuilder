require('dotenv').config();
const prisma = require('../db/prismaClient');
const container = require('../container');

async function verifyOrderFlow() {
    console.log('--- Order Flow Verification START ---');
    try {
        const storeId = 'ca2c95a0-ca56-43aa-8e9a-06984f0036d3';

        // 1. Identify a Product and ensure it has stock
        console.log('Finding a product...');
        let product = await prisma.product.findFirst({ where: { store_id: storeId } });
        if (!product) {
            console.log('Creating fresh test product...');
            product = await prisma.product.create({
                data: {
                    store: { connect: { id: storeId } },
                    name: 'Test Product ' + Date.now(),
                    price: 100.00,
                    stock: 10
                }
            });
        } else {
            console.log('Updating stock for product:', product.name);
            product = await prisma.product.update({
                where: { id: product.id },
                data: { stock: 10 }
            });
        }
        console.log('Product ready:', product.name, 'Stock:', product.stock);

        // 2. Create a cart with item
        const sessionId = 'test-session-' + Date.now();
        console.log('Creating cart for session:', sessionId);
        const cart = await prisma.cart.create({
            data: {
                session_id: sessionId,
                store: { connect: { id: storeId } }
            }
        });
        await prisma.cartItem.create({
            data: {
                cart: { connect: { id: cart.id } },
                product: { connect: { id: product.id } },
                quantity: 2
            }
        });

        // 3. Place order via Service (from Cart)
        console.log('Placing order from cart...');
        const dto = {
            storeId: storeId,
            customerName: 'Test UI',
            customerEmail: 'test@ui.com',
            customerPhone: '123',
            shippingAddress: 'Test Address'
        };

        const order = await container.orderService.createOrderFromCart(dto, null, sessionId);
        console.log('Order created:', order.id);

        // 4. Verify Results
        const remainingCartItems = await prisma.cartItem.count({ where: { cart_id: cart.id } });
        console.log('Remaining cart items (should be 0):', remainingCartItems);

        const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
        console.log('Old stock:', product.stock, 'New stock (should be 8):', updatedProduct.stock);

        // 5. Place direct order
        console.log('Placing direct order...');
        const directDto = {
            ...dto,
            items: [{ productId: product.id, quantity: 1 }]
        };
        const directOrder = await container.orderService.createOrder(directDto);
        console.log('Direct Order created:', directOrder.id);

        const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
        console.log('Final stock (should be 7):', finalProduct.stock);

        // 6. Test atomicity (failed transaction)
        console.log('Testing transaction failure...');
        try {
            await prisma.$transaction(async (tx) => {
                await container.orderModel.create({
                    store_id: storeId,
                    total_amount: 1,
                    customer_name: 'FAIL TEST'
                }, tx);
                throw new Error('Forced failure');
            });
        } catch (e) {
            console.log('Correctly caught forced error:', e.message);
        }
        const failOrder = await prisma.order.findFirst({ where: { customer_name: 'FAIL TEST' } });
        console.log('Fail order exists (should be null):', failOrder ? 'YES' : 'NO');

        console.log('--- Verification SUCCESS ---');

    } catch (error) {
        console.error('--- Verification FAILED ---');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyOrderFlow();
