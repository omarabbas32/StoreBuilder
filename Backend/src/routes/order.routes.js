const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/order.validator');
const { orderController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Order Routes
 */

router.post('/direct',
    validate(createOrderSchema),
    orderController.create
);

router.post('/checkout',
    validate(createOrderSchema),
    orderController.createFromCart
);

router.get('/store/:storeId',
    auth,
    orderController.getByStore
);

router.get('/:id',
    orderController.getById
);

router.put('/:id/status',
    auth,
    validate(updateOrderStatusSchema),
    orderController.updateStatus
);

module.exports = router;
