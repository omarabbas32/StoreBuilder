const express = require('express');
const router = express.Router();
const ThemeController = require('../controllers/theme.controller');
const auth = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

// Public: browse active themes
router.get('/', ThemeController.getAll);

// Admin: manage theme library
router.get('/admin', auth, restrictTo('admin'), ThemeController.adminGetAll);
router.post('/admin', auth, restrictTo('admin'), ThemeController.create);

module.exports = router;
