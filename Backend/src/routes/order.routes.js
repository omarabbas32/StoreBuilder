const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const schemas = require('../utils/schemas');

router.post('/', validate(schemas.createOrder), OrderController.create);
router.get('/my-orders', authMiddleware, OrderController.getMyOrders);
router.get('/store/:storeId', authMiddleware, OrderController.getByStore);

module.exports = router;
