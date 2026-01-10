const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const schemas = require('../utils/schemas');

router.post('/', authMiddleware, validate(schemas.createProduct), ProductController.create);
router.get('/', validate(schemas.filterProducts, 'query'), ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/reorder', authMiddleware, ProductController.reorder);
router.put('/:id', authMiddleware, validate(schemas.updateProduct), ProductController.update);
router.delete('/:id', authMiddleware, ProductController.delete);

module.exports = router;
