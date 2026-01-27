const express = require('express');
const router = express.Router();
const { themeController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Theme Routes
 */

router.get('/', themeController.getAll);
router.get('/admin', auth, themeController.adminGetAll);
router.post('/', auth, themeController.create);
router.post('/template', auth, themeController.createTemplate);
router.put('/:id', auth, themeController.update);
router.delete('/:id', auth, themeController.delete);

module.exports = router;
