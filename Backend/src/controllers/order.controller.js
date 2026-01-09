const OrderService = require('../services/order.service');
const StoreService = require('../services/store.service');
const CartService = require('../services/cart.service');

class OrderController {
    async create(req, res) {
        try {
            const { orderData, items, cartId } = req.body;
            const customerId = req.user?.id || null; // Get customer_id from auth if logged in

            if (!items || items.length === 0) {
                return res.status(400).json({ error: 'Order must have items' });
            }

            if (!orderData.store_id) {
                return res.status(400).json({ error: 'Store ID is required' });
            }

            // Enrich orderData with customer_id from auth
            const enrichedOrderData = {
                ...orderData,
                customer_id: customerId
            };

            const order = await OrderService.createOrder(enrichedOrderData, items, cartId);
            res.status(201).json(order);
        } catch (error) {
            console.error('Order creation error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async getByStore(req, res) {
        try {
            const { storeId } = req.params;
            const ownerId = req.user?.id;

            // Verify store ownership
            const store = await StoreService.getStoreById(storeId);
            if (!store || store.owner_id !== ownerId) {
                return res.status(403).json({ error: 'Forbidden: You do not own this store' });
            }

            const orders = await OrderService.getStoreOrders(storeId);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMyOrders(req, res) {
        try {
            const customerId = req.user?.id;
            const storeId = req.headers['x-store-id'];

            if (!customerId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const orders = await OrderService.getCustomerOrders(customerId, storeId);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new OrderController();

