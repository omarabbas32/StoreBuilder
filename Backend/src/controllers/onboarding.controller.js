const { asyncHandler } = require('../middleware/errorHandler');

class OnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }

    getSchema = asyncHandler(async (req, res) => {
        const schema = await this.onboardingService.getSchema();
        res.status(200).json({ success: true, data: schema });
    });

    completeStoreOnboarding = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await this.onboardingService.completeStoreOnboarding(id, req.body, req.user.id);
        res.status(200).json({ success: true, data: result });
    });

    assistantChat = asyncHandler(async (req, res) => {
        const { messages, provider = 'gemini' } = req.body;
        const result = await this.onboardingService.assistantChat(messages, req.user.id, provider);
        res.status(200).json({ success: true, data: result });
    });

}

module.exports = OnboardingController;
