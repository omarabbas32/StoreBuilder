const express = require('express');
const router = express.Router();
const { onboardingController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Onboarding Routes
 */

router.get('/schema', onboardingController.getSchema);
router.post('/ai-create', auth, onboardingController.aiCreateStore);
router.post('/:storeId/complete', auth, onboardingController.completeOnboarding);
router.post('/ai-chat', auth, onboardingController.aiChat);

module.exports = router;
