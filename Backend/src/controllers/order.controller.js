const OrderService = require('../services/order.service');
const StoreService = require('../services/store.service');
const response = require('../utils/response');

class OrderController {
    async create(req, res, next) {
        try {
            const { orderData, items, cartId } = req.body;
            const customerId = req.user?.id || null; // Get customer_id from auth if logged in

            if (!items || items.length === 0) {
                return response.error(res, 'Order must have items', 400);
            }

            if (!orderData.store_id) {
                return response.error(res, 'Store ID is required', 400);
            }

            // Enrich orderData with customer_id from auth
            const enrichedOrderData = {
                ...orderData,
                customer_id: customerId
            };

            const order = await OrderService.createOrder(enrichedOrderData, items, cartId);
            return response.success(res, order, 'Order created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async getByStore(req, res, next) {
        try {
            const { storeId } = req.params;
            const ownerId = req.user?.id;

            // Verify store ownership
            const store = await StoreService.getStoreById(storeId);
            if (!store || store.owner_id !== ownerId) {
                return response.error(res, 'Forbidden: You do not own this store', 403);
            }

            const orders = await OrderService.getStoreOrders(storeId);
            return response.success(res, orders);
        } catch (error) {
            next(error);
        }
    }

    async getMyOrders(req, res, next) {
        try {
            const customerId = req.user?.id;
            const storeId = req.headers['x-store-id'];

            if (!customerId) {
                return response.error(res, 'Unauthorized', 401);
            }

            const orders = await OrderService.getCustomerOrders(customerId, storeId);
            return response.success(res, orders);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();

