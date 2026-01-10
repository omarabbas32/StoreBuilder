const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const schemas = require('../utils/schemas');

router.post('/register', validate(schemas.register), AuthController.register);
router.post('/login', validate(schemas.login), AuthController.login);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getMe);

module.exports = router;
