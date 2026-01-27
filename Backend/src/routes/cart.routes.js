const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { addItemSchema, updateQuantitySchema } = require('../validators/cart.validator');
const { cartController } = require('../container');

/**
 * Cart Routes - Clean Architecture
 * 
 * Pattern:
 * 1. Validation middleware
 * 2. Controller method (thin, calls service)
 * 3. Service handles business logic
 */

// Add item to cart
router.post(
    '/add',
    validate(addItemSchema),
    cartController.addItem
);

// Update cart item quantity
router.put(
    '/:storeId/update',
    validate(updateQuantitySchema),
    cartController.updateQuantity
);

// Remove item from cart
router.delete(
    '/:storeId/remove/:productId',
    cartController.removeItem
);

// Get cart
router.get(
    '/:storeId',
    cartController.getCart
);

// Clear cart
router.delete(
    '/:storeId/clear',
    cartController.clearCart
);

module.exports = router;
