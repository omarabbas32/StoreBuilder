const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cart.controller');

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.put('/items', CartController.updateItem);
router.delete('/items/:productId', CartController.removeItem);
router.delete('/', CartController.clearCart);

module.exports = router;
