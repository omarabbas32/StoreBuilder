const express = require('express');
const router = express.Router();
const { onboardingController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Onboarding Routes
 */

router.get('/schema', onboardingController.getSchema);
router.post('/complete/:id', auth, onboardingController.completeStoreOnboarding);
router.post('/assistant-chat', auth, onboardingController.assistantChat);

module.exports = router;
