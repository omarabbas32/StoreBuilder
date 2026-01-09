const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', OrderController.create);
router.get('/my-orders', authMiddleware, OrderController.getMyOrders);
router.get('/store/:storeId', authMiddleware, OrderController.getByStore);

module.exports = router;
