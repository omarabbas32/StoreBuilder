const StoreService = require('../services/store.service');
const OnboardingService = require('../services/onboarding.service');
const AIService = require('../services/ai.service');
const response = require('../utils/response');

/**
 * Onboarding Controller - Provides API endpoints for AI agent store creation
 */
class OnboardingController {
    /**
     * GET /api/onboarding/schema
     * Returns the complete question schema for AI agents to use
     */
    getSchema = async (req, res, next) => {
        try {
            const schema = {
                version: '1.0',
                description: 'Schema for creating a store via AI agent',
                questions: [
                    {
                        field: 'name',
                        question: 'What would you like to name your store?',
                        type: 'text',
                        required: true,
                        validation: {
                            minLength: 1,
                            maxLength: 100
                        },
                        note: 'The slug will be auto-generated from the name'
                    },
                    {
                        field: 'storeCategory',
                        question: 'What type of store are you creating?',
                        type: 'single-select',
                        required: false,
                        options: [
                            { id: 'fashion', label: 'Fashion & Apparel', description: 'Clothing, accessories, jewelry' },
                            { id: 'electronics', label: 'Electronics', description: 'Gadgets, computers, phones' },
                            { id: 'food', label: 'Food & Beverage', description: 'Restaurants, cafes, food delivery' },
                            { id: 'services', label: 'Services', description: 'Consulting, repairs, bookings' },
                            { id: 'handmade', label: 'Handmade & Crafts', description: 'Artisan goods, custom products' },
                            { id: 'digital', label: 'Digital Products', description: 'Software, courses, downloads' },
                            { id: 'general', label: 'General Store', description: 'Multiple product categories' }
                        ]
                    },
                    {
                        field: 'logo_url',
                        question: 'Would you like to upload a logo?',
                        type: 'image-url',
                        required: false,
                        note: 'Provide a URL to the logo image'
                    },
                    {
                        field: 'brandColor',
                        question: "What's your brand color?",
                        type: 'color',
                        required: false,
                        default: '#2563eb',
                        validation: {
                            format: 'hex-color'
                        }
                    },
                    {
                        field: 'style_preference',
                        question: 'What style best describes your brand?',
                        type: 'single-select',
                        required: true,
                        options: [
                            { id: 'modern-minimal', label: 'Modern & Minimal', description: 'Clean lines and simple design' },
                            { id: 'classic-elegant', label: 'Classic & Elegant', description: 'Timeless and sophisticated' },
                            { id: 'bold-playful', label: 'Bold & Playful', description: 'Vibrant and energetic' },
                            { id: 'professional-corporate', label: 'Professional & Corporate', description: 'Professional and trustworthy' }
                        ]
                    },
                    {
                        field: 'enabledSections',
                        question: 'What sections do you want on your homepage?',
                        type: 'multi-select',
                        required: true,
                        minSelections: 1,
                        options: [
                            { id: 'hero', label: 'Large Hero Banner', description: 'Eye-catching banner at the top with image' },
                            { id: 'product-grid', label: 'Product Grid', description: 'Showcase your products in a grid layout' },
                            { id: 'highlight', label: 'Highlight Section', description: 'Special offers or announcements' },
                            { id: 'attributes', label: 'Trust Badges', description: 'Shipping, returns, security badges' }
                        ]
                    },
                    {
                        field: 'productDisplayStyle',
                        question: 'How should products be displayed?',
                        type: 'single-select',
                        required: true,
                        options: [
                            { id: 'grid-4', label: 'Grid (4 columns)', description: 'Show more products at once' },
                            { id: 'grid-3', label: 'Grid (3 columns)', description: 'Balanced product display' },
                            { id: 'list', label: 'List View', description: 'Detailed product information' },
                            { id: 'minimal', label: 'Minimal Cards', description: 'Simple and clean design' }
                        ]
                    },
                    {
                        field: 'categoryStructure',
                        question: 'How do you want to organize your products?',
                        type: 'single-select',
                        required: true,
                        options: [
                            { id: 'flat', label: 'Flat List', description: 'All categories at the same level' },
                            { id: 'hierarchical', label: 'Hierarchical', description: 'Categories with subcategories' }
                        ]
                    }
                ],
                defaults: {
                    brandColor: '#2563eb',
                    style_preference: 'modern-minimal',
                    enabledSections: ['hero', 'product-grid'],
                    productDisplayStyle: 'grid-4',
                    categoryStructure: 'flat'
                }
            };

            return response.success(res, schema);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/onboarding/ai-create
     * Creates a store from AI agent answers
     * Body: { answers: StoreCreationAnswers }
     */
    aiCreateStore = async (req, res, next) => {
        try {
            const ownerId = req.user?.id;
            if (!ownerId) {
                return response.error(res, 'Unauthorized', 401);
            }

            const { answers } = req.body;
            if (!answers) {
                return response.error(res, 'Missing answers in request body', 400);
            }

            // Apply sensible defaults if fields are missing
            const finalAnswers = {
                brandColor: '#2563eb',
                style_preference: 'modern-minimal',
                enabledSections: ['hero', 'product-grid'],
                productDisplayStyle: 'grid-4',
                categoryStructure: 'flat',
                storeCategory: 'general',
                ...answers
            };

            // Validate required fields
            const validationErrors = this.validateAnswers(finalAnswers);
            if (validationErrors.length > 0) {
                return response.error(res, `Validation errors: ${validationErrors.join(', ')}`, 400);
            }

            // Use finalAnswers for the rest of the process
            const answersToUse = finalAnswers;

            // Generate slug from name if not provided
            const slug = answersToUse.slug || this.generateSlug(answersToUse.name);

            // Check if slug already exists
            const existingStore = await StoreService.getStoreBySlug(slug);
            if (existingStore) {
                return response.error(res, `Store with slug "${slug}" already exists`, 409);
            }

            // Create the store first
            const storeData = {
                owner_id: ownerId,
                name: answersToUse.name,
                slug: slug,
                description: answersToUse.description || `${answersToUse.name} - Created via AI`,
                settings: {}
            };

            const store = await StoreService.createStore(storeData);

            // Generate configuration from answers using OnboardingService
            const config = await OnboardingService.generateStoreConfig({
                ...answersToUse,
                slug: slug
            });

            // Update store with the generated configuration
            const updatedStore = await StoreService.updateStore(store.id, {
                settings: config
            });

            return response.success(res, updatedStore, 'Store created successfully via AI agent', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/onboarding/:storeId/complete
     * Completes onboarding for an existing store
     */
    completeOnboarding = async (req, res, next) => {
        try {
            const ownerId = req.user?.id;
            const storeId = req.params.storeId;
            const answers = req.body;

            if (!ownerId) {
                return response.error(res, 'Unauthorized', 401);
            }

            // Verify ownership
            const existingStore = await StoreService.getStoreById(storeId);
            if (!existingStore) {
                return response.error(res, 'Store not found', 404);
            }
            if (existingStore.owner_id !== ownerId) {
                return response.error(res, 'Forbidden: You do not own this store', 403);
            }

            // Generate configuration from answers
            const config = await OnboardingService.generateStoreConfig(answers);

            // Update store with configuration
            const updatedStore = await StoreService.updateStore(storeId, {
                name: answers.name || existingStore.name,
                slug: answers.slug || existingStore.slug,
                settings: config
            });

            return response.success(res, updatedStore, 'Onboarding completed successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/onboarding/ai-chat
     * Handles conversational AI chat for onboarding using Groq
     */
    aiChat = async (req, res, next) => {
        try {
            const { messages, provider } = req.body;
            if (!messages || !Array.isArray(messages)) {
                return response.error(res, 'Messages array is required', 400);
            }

            // Standard onboarding schema for context
            const schema = {
                questions: [
                    { field: 'name', question: 'Store name', type: 'text', required: true },
                    { field: 'storeCategory', question: 'Store category', type: 'single-select', required: false },
                    { field: 'style_preference', question: 'Style preference', type: 'single-select', required: true },
                    { field: 'brandColor', question: 'Brand color', type: 'color', required: false },
                    { field: 'enabledSections', question: 'Homepage sections', type: 'multi-select', required: true },
                    { field: 'productDisplayStyle', question: 'Product display style', type: 'single-select', required: true },
                    { field: 'categoryStructure', question: 'Category structure', type: 'single-select', required: true }
                ]
            };

            const result = await AIService.chat(messages, schema, provider);
            if (!result.success) {
                return response.error(res, result.error, 500);
            }

            return response.success(res, {
                message: result.message,
                extractedAnswers: result.extractedAnswers,
                isComplete: result.isComplete
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate answers from AI agent
     */
    validateAnswers = (answers) => {
        const errors = [];

        // Required: name
        if (!answers.name || typeof answers.name !== 'string' || answers.name.trim().length === 0) {
            errors.push('name is required');
        }

        // Required: style_preference
        const validStyles = ['modern-minimal', 'classic-elegant', 'bold-playful', 'professional-corporate'];
        if (!answers.style_preference || !validStyles.includes(answers.style_preference)) {
            errors.push(`style_preference must be one of: ${validStyles.join(', ')}`);
        }

        // Required: enabledSections (at least one)
        const validSections = ['hero', 'product-grid', 'highlight', 'attributes'];
        if (!answers.enabledSections || !Array.isArray(answers.enabledSections) || answers.enabledSections.length === 0) {
            errors.push('enabledSections must be an array with at least one section');
        } else {
            const invalidSections = answers.enabledSections.filter(s => !validSections.includes(s));
            if (invalidSections.length > 0) {
                errors.push(`Invalid sections: ${invalidSections.join(', ')}. Valid options: ${validSections.join(', ')}`);
            }
        }

        // Required: productDisplayStyle
        const validDisplayStyles = ['grid-4', 'grid-3', 'list', 'minimal'];
        if (!answers.productDisplayStyle || !validDisplayStyles.includes(answers.productDisplayStyle)) {
            errors.push(`productDisplayStyle must be one of: ${validDisplayStyles.join(', ')}`);
        }

        // Required: categoryStructure
        const validCategoryStructures = ['flat', 'hierarchical'];
        if (!answers.categoryStructure || !validCategoryStructures.includes(answers.categoryStructure)) {
            errors.push(`categoryStructure must be one of: ${validCategoryStructures.join(', ')}`);
        }

        // Optional: brandColor validation
        if (answers.brandColor && !/^#[0-9A-Fa-f]{6}$/.test(answers.brandColor)) {
            errors.push('brandColor must be a valid hex color (e.g., #2563eb)');
        }

        // Optional: storeCategory validation
        const validCategories = ['fashion', 'electronics', 'food', 'services', 'handmade', 'digital', 'general'];
        if (answers.storeCategory && !validCategories.includes(answers.storeCategory)) {
            errors.push(`storeCategory must be one of: ${validCategories.join(', ')}`);
        }

        return errors;
    }

    /**
     * Generate slug from store name
     */
    generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
}

module.exports = new OnboardingController();
