const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.post('/', authMiddleware, restrictTo('admin'), CategoryController.create);
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

module.exports = router;
