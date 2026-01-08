const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/store.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, StoreController.create);
router.get('/', authMiddleware, StoreController.getAll);
router.get('/:id', StoreController.getByIdOrSlug);
router.put('/:id', authMiddleware, StoreController.update);

module.exports = router;
