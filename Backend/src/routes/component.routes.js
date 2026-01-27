const express = require('express');
const router = express.Router();
const { componentController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Component Routes
 */

router.get('/active', componentController.getActive);
router.get('/admin', auth, componentController.adminGetAll);
router.post('/', auth, componentController.create);
router.put('/:id', auth, componentController.update);
router.delete('/:id', auth, componentController.delete);
router.patch('/:id/toggle', auth, componentController.toggleActive);

module.exports = router;
