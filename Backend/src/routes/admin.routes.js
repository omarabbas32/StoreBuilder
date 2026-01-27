const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Protect all admin routes
router.use(authMiddleware, restrictTo('admin'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/stores', AdminController.listAllStores);

module.exports = router;
