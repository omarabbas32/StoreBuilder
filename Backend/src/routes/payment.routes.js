const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');

router.post('/process', authMiddleware, PaymentController.process);

module.exports = router;
