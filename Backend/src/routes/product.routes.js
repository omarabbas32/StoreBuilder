const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema, reorderProductsSchema } = require('../validators/product.validator');
const { productController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Product Routes
 */

router.get('/:storeId', productController.getByStore);
router.get('/item/:id', productController.getById);

router.post('/',
    auth,
    validate(createProductSchema),
    productController.create
);

router.put('/:id',
    auth,
    validate(updateProductSchema),
    productController.update
);

router.post('/reorder',
    auth,
    validate(reorderProductsSchema),
    productController.reorder
);

router.delete('/:id',
    auth,
    productController.delete
);

module.exports = router;
