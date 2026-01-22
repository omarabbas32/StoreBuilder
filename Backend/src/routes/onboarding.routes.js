const express = require('express');
const router = express.Router();
const OnboardingController = require('../controllers/onboarding.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * Onboarding Routes for AI Agent Integration
 */

// GET /api/onboarding/schema - Get the question schema (public)
router.get('/schema', OnboardingController.getSchema.bind(OnboardingController));

// POST /api/onboarding/ai-create - Create store via AI agent (requires auth)
router.post('/ai-create', authMiddleware, OnboardingController.aiCreateStore.bind(OnboardingController));

// POST /api/onboarding/:storeId/complete - Complete onboarding for existing store (requires auth)
router.post('/:storeId/complete', authMiddleware, OnboardingController.completeOnboarding.bind(OnboardingController));

// POST /api/onboarding/ai-chat - Chat with AI for onboarding (requires auth)
router.post('/ai-chat', authMiddleware, OnboardingController.aiChat.bind(OnboardingController));

module.exports = router;
