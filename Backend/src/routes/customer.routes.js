const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, CustomerController.create);
router.get('/:id', authMiddleware, CustomerController.getById);

module.exports = router;
