const OrderService = require('../services/order.service');
const StoreService = require('../services/store.service');

class OrderController {
    async create(req, res) {
        try {
            const { orderData, items } = req.body;

            if (!items || items.length === 0) {
                return res.status(400).json({ error: 'Order must have items' });
            }

            const order = await OrderService.createOrder(orderData, items);
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
}

module.exports = new OrderController();
