const ThemeService = require('./theme.service');
const ComponentService = require('./component.service');

class OnboardingService {
    /**
     * Maps style preference to theme slug/name
     */
    async getThemeIdByStyle(stylePreference) {
        const styleToKeywords = {
            'modern-minimal': ['modern', 'minimal', 'clean'],
            'classic-elegant': ['classic', 'elegant', 'sophisticated'],
            'bold-playful': ['bold', 'playful', 'vibrant'],
            'professional-corporate': ['professional', 'corporate', 'business']
        };

        const keywords = styleToKeywords[stylePreference] || ['modern', 'minimal'];

        // Get all active themes
        const themes = await ThemeService.getAllThemes();

        if (themes.length === 0) {
            return null;
        }

        // Try to find theme by name matching keywords
        const themeName = stylePreference.replace('-', ' ');
        let theme = themes.find(t => {
            const nameLower = (t.name || '').toLowerCase();
            return keywords.some(keyword => nameLower.includes(keyword)) ||
                nameLower.includes(themeName);
        });

        // Fallback to first available theme if no match
        if (!theme) {
            theme = themes[0];
        }

        return theme?.id || null;
    }

    /**
     * Maps enabled sections to component IDs
     */
    async getComponentIdsBySections(enabledSections) {
        const sectionToTypeMap = {
            'hero': 'hero',
            'categories': 'product-grid', // Categories can be shown in product grid
            'highlight': 'highlight',
            'product-grid': 'product-grid',
            'attributes': 'attributes'
        };

        const componentTypes = enabledSections
            .map(section => sectionToTypeMap[section])
            .filter(Boolean);

        // Get all active components
        const components = await ComponentService.getActiveComponents();

        // Find components by type, in the order they were selected
        const componentIds = [];
        const seenTypes = new Set();

        for (const type of componentTypes) {
            if (seenTypes.has(type)) continue;

            const component = components.find(c => c.type === type);
            if (component && !componentIds.includes(component.id)) {
                componentIds.push(component.id);
                seenTypes.add(type);
            }
        }

        // Always include navigation, footer, and hero if available to avoid "empty" look
        const navbar = components.find(c => c.type === 'navigation');
        const footer = components.find(c => c.type === 'footer');
        const hero = components.find(c => c.type === 'hero');

        if (navbar && !componentIds.includes(navbar.id)) {
            componentIds.unshift(navbar.id); // Add at beginning
        }
        if (hero && !componentIds.includes(hero.id)) {
            // Add hero after navbar or at beginning
            const insertIndex = componentIds.includes(navbar?.id) ? 1 : 0;
            componentIds.splice(insertIndex, 0, hero.id);
        }
        if (footer && !componentIds.includes(footer.id)) {
            componentIds.push(footer.id); // Add at end
        }

        return componentIds;
    }

    /**
     * Generate default content for components based on sections
     */
    generateDefaultContent(enabledSections, componentIds, availableComponents) {
        const content = {};

        availableComponents.forEach(component => {
            if (!componentIds.includes(component.id)) return;

            switch (component.type) {
                case 'hero':
                    content[component.id] = {
                        title: 'Welcome to Our Store',
                        subtitle: 'Discover amazing products',
                        image: '',
                        ctaText: 'Shop Now',
                        ctaLink: '#products'
                    };
                    break;
                case 'highlight':
                    content[component.id] = {
                        title: 'Special Offer',
                        description: 'Check out our latest deals',
                        image: ''
                    };
                    break;
                case 'product-grid':
                    content[component.id] = {
                        title: 'Featured Products',
                        limit: 8
                    };
                    break;
                case 'attributes':
                    content[component.id] = {
                        items: [
                            { icon: '🚚', title: 'Free Shipping', description: 'On orders over $50' },
                            { icon: '↩️', title: 'Easy Returns', description: '30-day return policy' },
                            { icon: '🔒', title: 'Secure Payment', description: '100% secure checkout' },
                            { icon: '💬', title: '24/7 Support', description: 'We\'re here to help' }
                        ]
                    };
                    break;
                case 'navigation':
                    content[component.id] = {
                        showSearch: true,
                        showCart: true
                    };
                    break;
                case 'footer':
                    content[component.id] = {
                        showLinks: true,
                        showSocial: false
                    };
                    break;
                default:
                    content[component.id] = {};
            }
        });

        return content;
    }

    /**
     * Extract grid columns from product display style
     */
    extractColumns(productDisplayStyle) {
        const styleToColumns = {
            'grid-4': 4,
            'grid-3': 3,
            'list': 1,
            'minimal': 3
        };
        return styleToColumns[productDisplayStyle] || 4;
    }

    /**
     * Generate complete store configuration from onboarding answers
     */
    async generateStoreConfig(answers) {
        // Get available themes and components
        const [themes, components] = await Promise.all([
            ThemeService.getAllThemes(),
            ComponentService.getActiveComponents()
        ]);

        // Map style preference to theme ID
        const themeId = await this.getThemeIdByStyle(answers.style_preference || 'modern-minimal');

        // Map enabled sections to component IDs
        const componentIds = await this.getComponentIdsBySections(
            answers.enabledSections || ['product-grid']
        );

        // Generate default content for components
        const componentContent = this.generateDefaultContent(
            answers.enabledSections || [],
            componentIds,
            components
        );

        // Build configuration object
        const brandColor = answers.brandColor || '#2563eb';
        const config = {
            themeId: themeId,
            primaryColor: brandColor, // Backward compatibility
            colorPalette: [brandColor], // New multi-color support
            logo_url: answers.logo_url || null,
            componentIds: componentIds,
            componentContent: componentContent,
            productCardStyle: answers.productDisplayStyle || 'grid-4',
            layout: {
                productGridColumns: this.extractColumns(answers.productDisplayStyle || 'grid-4'),
                categoryLayout: answers.categoryStructure || 'flat'
            },
            onboardingCompleted: true,
            onboardingAnswers: {
                style_preference: answers.style_preference,
                enabledSections: answers.enabledSections,
                productDisplayStyle: answers.productDisplayStyle,
                categoryStructure: answers.categoryStructure
            }
        };

        return config;
    }
}

module.exports = new OnboardingService();

