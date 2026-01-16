const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/store.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const schemas = require('../utils/schemas');

router.post('/', authMiddleware, validate(schemas.createStore), StoreController.create);
router.get('/', authMiddleware, StoreController.getAll);
router.get('/:id', StoreController.getByIdOrSlug);
router.put('/:id', authMiddleware, validate(schemas.updateStore), StoreController.update);
router.post('/:id/onboarding', authMiddleware, StoreController.completeOnboarding);

module.exports = router;
