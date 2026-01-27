const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, resetPasswordSchema } = require('../validators/auth.validator');
const { authController } = require('../container');

/**
 * Auth Routes
 */

router.post('/register',
    validate(registerSchema),
    authController.register
);

router.post('/login',
    validate(loginSchema),
    authController.login
);

router.post('/verify-email', authController.verifyEmail);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password',
    validate(resetPasswordSchema),
    authController.resetPassword
);

module.exports = router;
