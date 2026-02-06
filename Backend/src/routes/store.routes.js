const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { createStoreSchema, updateStoreSchema } = require('../validators/store.validator');
const container = require('../container');
const { auth } = require('../middleware/auth');

const { storeController } = container;

console.log('[DEBUG_STORE_ROUTES] storeController exists:', !!storeController);
if (storeController) {
    console.log('[DEBUG_STORE_ROUTES] storeController.getAll exists:', !!storeController.getAll);
}

/**
 * Store Routes
 */

router.get('/', storeController.getAll);
router.get('/slug/:slug', storeController.getBySlug);
router.get('/:id', storeController.getById);

router.post('/',
    auth,
    validate(createStoreSchema),
    storeController.create
);

router.put('/:id',
    auth,
    validate(updateStoreSchema),
    storeController.update
);

router.put('/:id/components/:componentId',
    auth,
    storeController.updateComponentContent
);

router.delete('/:id',
    auth,
    storeController.delete
);

module.exports = router;
