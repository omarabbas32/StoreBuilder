const express = require('express');
const router = express.Router();
const ComponentController = require('../controllers/component.controller');
const auth = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

// Public route: get active components for stores
router.get('/', ComponentController.getActive);

// Admin routes: manage component library
router.get('/admin', auth, restrictTo('admin'), ComponentController.adminGetAll);
router.post('/admin', auth, restrictTo('admin'), ComponentController.create);

module.exports = router;
