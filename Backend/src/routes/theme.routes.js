const express = require('express');
const router = express.Router();
const ThemeController = require('../controllers/theme.controller');
const auth = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

// Public/Auth: browse active themes (auth optional for user-specific templates)
router.get('/', (req, res, next) => {
    // Try to get user if token exists, but don't fail if not
    auth(req, res, () => ThemeController.getAll(req, res, next));
});

// User: save current design as template
router.post('/', auth, ThemeController.createTemplate);

// Admin: manage theme library
router.get('/admin', auth, restrictTo('admin'), ThemeController.adminGetAll);
router.post('/admin', auth, restrictTo('admin'), ThemeController.create);

module.exports = router;
