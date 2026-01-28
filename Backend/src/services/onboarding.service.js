const AppError = require('../utils/AppError');

/**
 * OnboardingService - Store onboarding flow
 * 
 * Handles AI-powered store setup and configuration generation
 */
class OnboardingService {
    constructor({ themeService, componentService, storeService, aiService }) {
        this.themeService = themeService;
        this.componentService = componentService;
        this.storeService = storeService;
        this.aiService = aiService;
    }

    /**
     * Get the onboarding question schema
     */
    async getSchema() {
        return {
            version: '1.0',
            description: 'Schema for creating a store via AI agent',
            questions: [
                {
                    field: 'name',
                    question: 'What would you like to name your store?',
                    type: 'text',
                    required: true,
                    validation: { minLength: 1, maxLength: 100 }
                },
                {
                    field: 'storeCategory',
                    question: 'What type of store are you creating?',
                    type: 'single-select',
                    required: false,
                    options: [
                        { id: 'fashion', label: 'Fashion & Apparel' },
                        { id: 'electronics', label: 'Electronics' },
                        { id: 'food', label: 'Food & Beverage' },
                        { id: 'services', label: 'Services' },
                        { id: 'handmade', label: 'Handmade & Crafts' },
                        { id: 'digital', label: 'Digital Products' },
                        { id: 'general', label: 'General Store' }
                    ]
                },
                {
                    field: 'style_preference',
                    question: 'What style best describes your brand?',
                    type: 'single-select',
                    required: true,
                    options: [
                        { id: 'modern-minimal', label: 'Modern & Minimal' },
                        { id: 'classic-elegant', label: 'Classic & Elegant' },
                        { id: 'bold-playful', label: 'Bold & Playful' },
                        { id: 'professional-corporate', label: 'Professional & Corporate' }
                    ]
                },
                {
                    field: 'enabledSections',
                    question: 'What sections do you want on your homepage?',
                    type: 'multi-select',
                    required: true,
                    minSelections: 1,
                    options: [
                        { id: 'hero', label: 'Large Hero Banner' },
                        { id: 'product-grid', label: 'Product Grid' },
                        { id: 'highlight', label: 'Highlight Section' },
                        { id: 'attributes', label: 'Trust Badges' }
                    ]
                },
                {
                    field: 'productDisplayStyle',
                    question: 'How should products be displayed?',
                    type: 'single-select',
                    required: true,
                    options: [
                        { id: 'grid-4', label: 'Grid (4 columns)' },
                        { id: 'grid-3', label: 'Grid (3 columns)' },
                        { id: 'list', label: 'List View' },
                        { id: 'minimal', label: 'Minimal Cards' }
                    ]
                },
                {
                    field: 'description',
                    question: 'What does your store sell? Describe your business briefly.',
                    type: 'text',
                    required: false,
                    validation: { maxLength: 500 }
                },
                {
                    field: 'tagline',
                    question: 'Give us a catchy tagline for your store.',
                    type: 'text',
                    required: false,
                    validation: { maxLength: 100 }
                },
                {
                    field: 'socialLinks',
                    question: 'Share your social media links (Facebook, Instagram, etc.).',
                    type: 'social-links',
                    required: false,
                    options: [
                        { id: 'facebook_url', label: 'Facebook' },
                        { id: 'instagram_url', label: 'Instagram' },
                        { id: 'twitter_url', label: 'Twitter' },
                        { id: 'linkedin_url', label: 'LinkedIn' },
                        { id: 'tiktok_url', label: 'TikTok' }
                    ]
                },
                {
                    field: 'contactInfo',
                    question: 'What is your business email and phone number?',
                    type: 'contact',
                    required: false,
                    options: [
                        { id: 'contact_email', label: 'Email' },
                        { id: 'contact_phone', label: 'Phone' },
                        { id: 'address', label: 'Address' }
                    ]
                },
                {
                    field: 'businessHours',
                    question: 'What are your typical business hours?',
                    type: 'business-hours',
                    required: false
                }
            ]
        };
    }

    /**
     * AI-Create store from answers
     */
    async aiCreateStore(answers, ownerId) {
        // Validate required fields
        if (!answers.name) throw new AppError('Store name is required', 400);

        // Generate slug
        const slug = answers.slug || answers.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check availability
        const existing = await this.storeService.getStoreBySlug(slug).catch(() => null);
        if (existing) throw new AppError(`Store with slug "${slug}" already exists`, 409);

        const { validateSocialUrl } = require('../utils/urlValidator');

        // Extract and validate social links
        const socialFields = ['facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url', 'tiktok_url'];
        const validatedSocials = {};
        const socialSource = answers.socialLinks || answers;
        for (const field of socialFields) {
            if (socialSource[field]) {
                const result = validateSocialUrl(field, socialSource[field]);
                validatedSocials[field] = result.valid ? result.url : null;
            }
        }

        // Extract contact info
        const contactSource = answers.contactInfo || answers;
        const contactData = {
            contact_email: contactSource.contact_email || null,
            contact_phone: contactSource.contact_phone || null,
            address: contactSource.address || null
        };

        // Create store
        const store = await this.storeService.createStore({
            name: answers.name,
            slug,
            description: answers.description || `${answers.name} - Created via AI`,
            tagline: answers.tagline || null,
            business_hours: answers.businessHours || {},
            ...contactData,
            ...validatedSocials,
            settings: {}
        }, ownerId);

        // Generate full config
        const config = await this.generateStoreConfig(answers);

        // Update store with config
        return await this.storeService.updateStore(store.id, { settings: config }, ownerId);
    }

    /**
     * Complete onboarding for an existing store
     */
    async completeStoreOnboarding(storeId, answers, ownerId) {
        // Verify store exists and belongs to owner
        const store = await this.storeService.getStore(storeId);
        if (store.owner_id !== ownerId) {
            throw new AppError('Unauthorized access to store', 403);
        }

        const { validateSocialUrl } = require('../utils/urlValidator');

        // Generate full config based on wizard answers
        const config = await this.generateStoreConfig(answers);

        // Update store settings and basic info if changed
        const updateData = {
            settings: config
        };

        if (answers.name) updateData.name = answers.name;
        if (answers.slug) updateData.slug = answers.slug;
        if (answers.description) updateData.description = answers.description;
        if (answers.tagline) updateData.tagline = answers.tagline;
        if (answers.businessHours) updateData.business_hours = answers.businessHours;

        // Contact info
        const contactSource = answers.contactInfo || answers;
        if (contactSource.contact_email) updateData.contact_email = contactSource.contact_email;
        if (contactSource.contact_phone) updateData.contact_phone = contactSource.contact_phone;
        if (contactSource.address) updateData.address = contactSource.address;

        // Social links
        const socialFields = ['facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url', 'tiktok_url'];
        const socialSource = answers.socialLinks || answers;
        for (const field of socialFields) {
            if (socialSource[field]) {
                const result = validateSocialUrl(field, socialSource[field]);
                if (result.valid) updateData[field] = result.url;
            }
        }

        return await this.storeService.updateStore(storeId, updateData, ownerId);
    }

    /**
     * Chat with AI for onboarding
     */
    async aiChat(messages, provider) {
        const schema = await this.getSchema();
        return await this.aiService.chat(messages, schema, provider);
    }

    /**
     * Map style preference to theme ID
     */
    async getThemeIdByStyle(stylePreference) {
        const styleToKeywords = {
            'modern-minimal': ['modern', 'minimal', 'clean'],
            'classic-elegant': ['classic', 'elegant', 'sophisticated'],
            'bold-playful': ['bold', 'playful', 'vibrant'],
            'professional-corporate': ['professional', 'corporate', 'business']
        };

        const keywords = styleToKeywords[stylePreference] || ['modern', 'minimal'];
        const themes = await this.themeService.getAllThemes();

        if (themes.length === 0) return null;

        const themeName = stylePreference.replace('-', ' ');
        let theme = themes.find(t => {
            const nameLower = (t.name || '').toLowerCase();
            return keywords.some(keyword => nameLower.includes(keyword)) ||
                nameLower.includes(themeName);
        });

        if (!theme) theme = themes[0];
        return theme?.id || null;
    }

    /**
     * Map enabled sections to component IDs
     */
    async getComponentIdsBySections(enabledSections) {
        const sectionToTypeMap = {
            'hero': 'hero',
            'categories': 'product-grid',
            'highlight': 'highlight',
            'product-grid': 'product-grid',
            'attributes': 'attributes'
        };

        const componentTypes = enabledSections
            .map(section => sectionToTypeMap[section])
            .filter(Boolean);

        const components = await this.componentService.getActiveComponents();
        const componentIds = [];
        const seenTypes = new Set();

        for (const type of componentTypes) {
            if (seenTypes.has(type)) continue;
            const component = components.find(c => c.type === type);
            if (component) {
                componentIds.push(component.id);
                seenTypes.add(type);
            }
        }

        const defaults = ['navigation', 'footer', 'hero'];
        for (const type of defaults) {
            if (seenTypes.has(type)) continue;
            const component = components.find(c => c.type === type);
            if (component) {
                if (type === 'navigation') componentIds.unshift(component.id);
                else componentIds.push(component.id);
            }
        }

        return componentIds;
    }

    /**
     * Generate default content for components
     */
    generateDefaultContent(componentIds, availableComponents) {
        const content = {};
        availableComponents.forEach(component => {
            if (!componentIds.includes(component.id)) return;
            switch (component.type) {
                case 'hero':
                    content[component.id] = { title: 'Welcome', subtitle: 'Our Store', ctaText: 'Shop Now' };
                    break;
                case 'product-grid':
                    content[component.id] = { title: 'Products', limit: 8 };
                    break;
                default:
                    content[component.id] = {};
            }
        });
        return content;
    }

    /**
     * Generate complete store configuration
     */
    async generateStoreConfig(answers) {
        const [themes, components] = await Promise.all([
            this.themeService.getAllThemes(),
            this.componentService.getActiveComponents()
        ]);

        const themeId = await this.getThemeIdByStyle(answers.style_preference || 'modern-minimal');
        const componentIds = await this.getComponentIdsBySections(answers.enabledSections || ['product-grid']);
        const componentContent = this.generateDefaultContent(componentIds, components);

        return {
            themeId,
            primaryColor: answers.brandColor || '#2563eb',
            componentIds,
            componentContent,
            onboardingCompleted: true
        };
    }
}

module.exports = OnboardingService;
