const { asyncHandler } = require('../middleware/errorHandler');

class OnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }

    getSchema = asyncHandler(async (req, res) => {
        const schema = await this.onboardingService.getSchema();
        res.status(200).json({ success: true, data: schema });
    });

    aiCreateStore = asyncHandler(async (req, res) => {
        const { answers } = req.body;
        const result = await this.onboardingService.aiCreateStore(answers, req.user.id);
        res.status(201).json({ success: true, data: result });
    });

    completeStoreOnboarding = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await this.onboardingService.completeStoreOnboarding(id, req.body, req.user.id);
        res.status(200).json({ success: true, data: result });
    });

    aiChat = asyncHandler(async (req, res) => {
        const { messages, provider } = req.body;
        const result = await this.onboardingService.aiChat(messages, provider);
        res.status(200).json({ success: true, data: result });
    });
}

module.exports = OnboardingController;
