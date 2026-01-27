const express = require('express');
const router = express.Router();
const { customerController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Customer Routes
 */

router.get('/me', auth, customerController.getByUserId);
router.get('/:id', auth, customerController.getById);
router.post('/', auth, customerController.create);
router.put('/:id', auth, customerController.update);
router.delete('/:id', auth, customerController.delete);

module.exports = router;
