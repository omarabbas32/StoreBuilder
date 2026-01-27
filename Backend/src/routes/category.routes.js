const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validator');
const { categoryController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Category Routes
 */

router.get('/store/:storeId', categoryController.getByStore);
router.get('/:id', categoryController.getById);

router.post('/',
    auth,
    validate(createCategorySchema),
    categoryController.create
);

router.put('/:id',
    auth,
    validate(updateCategorySchema),
    categoryController.update
);

router.delete('/:id',
    auth,
    categoryController.delete
);

module.exports = router;
