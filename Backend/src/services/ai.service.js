const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../utils/AppError');

/**
 * AIService - AI/LLM integration service
 * 
 * Handles AI-powered features like onboarding chat
 * Supports multiple providers with failover
 */
class AIService {
    constructor() {
        this.groq = process.env.GROQ_API_KEY
            ? new Groq({ apiKey: process.env.GROQ_API_KEY })
            : null;
        this.genAI = process.env.GEMINI_API_KEY
            ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            : null;
    }

    /**
     * Generate AI response for onboarding chat
     * Providers: OpenAI → OpenRouter → Groq (failover)
     */
    async chat(messages, schema, initialProvider = process.env.AI_PROVIDER || 'openai') {
        const providers = [initialProvider, 'openrouter', 'groq']
            .filter((p, i, self) => self.indexOf(p) === i);

        let lastError = null;

        for (const provider of providers) {
            console.log(`[AIService] Attempting with provider: ${provider}`);

            try {
                const response = await this._callProvider(provider, messages, schema);
                if (response && response.message) {
                    console.log(`[AIService] Success with ${provider}`);
                    return {
                        success: true,
                        message: response.message,
                        extractedAnswers: response.extractedAnswers || {},
                        isComplete: !!response.isComplete,
                        providerUsed: provider
                    };
                }
            } catch (error) {
                console.error(`[AIService] Provider ${provider} failed:`, error.message);
                lastError = error;
            }
        }

        return {
            success: false,
            error: lastError?.message || 'All AI providers failed'
        };
    }

    /**
     * Call specific AI provider
     */
    async _callProvider(provider, messages, schema) {
        // Create minimal schema for token optimization
        const minimalSchema = schema.questions.map(q => ({
            f: q.field,
            t: q.type,
            r: q.required,
            o: q.options ? q.options.map(opt => opt.id) : undefined
        }));

        const systemPrompt = `You are a helpful AI store builder. Your goal is to help the user set up their online store through a natural conversation.
        
        Extract configuration from the chat based on the MINIMAL SCHEMA below.
        
        MINIMAL SCHEMA (f=field, t=type, r=required, o=options):
        ${JSON.stringify(minimalSchema)}
        
        RESPONSE FORMAT (JSON ONLY):
        {
          "message": "Friendly response. Ask ONE question for the first missing required field.",
          "extractedAnswers": { "FIELD_NAME": "VALUE" },
          "isComplete": false
        }
        
        RULES:
        1. Return ONLY JSON. No other text.
        2. For options (o), use the EXACT ID from the list.
        3. If user choice is clear, extract it immediately.
        4. "isComplete" = true ONLY if all fields marked r:true (required) are present in extractedAnswers.
        5. Use hex codes for colors (e.g., #FF5733).
        6. For complex types:
           - socialLinks: Extract as an object with keys matching the option IDs (e.g., { "facebook_url": "https://..." }).
           - contactInfo: Extract as an object with keys matching the option IDs (e.g., { "contact_email": "...", "contact_phone": "..." }).
           - businessHours: Extract as a flexible JSON object (e.g., { "Monday-Friday": "9am - 6pm" }) or a descriptive string.
        7. Be conversational and helpful. Ask ONE question at a time.
        8. If the user provides multiple pieces of information in one message, extract them ALL.
        9. If you have enough info to complete, set "isComplete": true and give a congratulatory message.`;

        const model = provider === 'openai' ? 'gpt-4o-mini' :
            provider === 'groq' ? 'llama-3.3-70b-versatile' :
                provider === 'gemini' ? 'gemini-2.0-flash' :
                    'google/gemini-2.0-flash-exp:free';

        let responseData = null;

        if (provider === 'openai') {
            if (!process.env.OPENAI_API_KEY) {
                throw new AppError('Missing OPENAI_API_KEY', 500);
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY.trim()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'system', content: systemPrompt }, ...messages],
                    response_format: { type: 'json_object' },
                    temperature: 0.1
                })
            });

            const data = await response.json();
            if (data.error) throw new AppError(`OpenAI Error: ${data.error.message}`, 500);
            responseData = this.safeParseJSON(data.choices?.[0]?.message?.content);

        } else if (provider === 'groq') {
            if (!this.groq) {
                throw new AppError('Missing GROQ_API_KEY', 500);
            }

            const response = await this.groq.chat.completions.create({
                messages: [{ role: 'system', content: systemPrompt }, ...messages],
                model,
                temperature: 0.1,
                response_format: { type: 'json_object' }
            });

            responseData = this.safeParseJSON(response.choices?.[0]?.message?.content);

        } else if (provider === 'openrouter') {
            if (!process.env.OPENROUTER_API_KEY) {
                throw new AppError('Missing OPENROUTER_API_KEY', 500);
            }

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY.trim()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'system', content: systemPrompt }, ...messages],
                    temperature: 0.1
                })
            });

            const data = await response.json();
            if (data.error) throw new AppError(`OpenRouter Error: ${data.error.message}`, 500);
            responseData = this.safeParseJSON(data.choices?.[0]?.message?.content);
        } else if (provider === 'gemini') {
            if (!this.genAI) {
                throw new AppError('Missing GEMINI_API_KEY', 500);
            }

            const geminiModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Format messages for Gemini
            // system prompt is handled as a separate instruction or part of the first message
            const prompt = `${systemPrompt}\n\nChat History:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            responseData = this.safeParseJSON(response.text());
        }

        return responseData;
    }

    /**
     * Parse JSON from LLM output (handles markdown code blocks)
     */
    safeParseJSON(str) {
        if (!str) return null;

        let clean = str.trim();

        // Remove markdown code blocks
        if (clean.includes('```json')) {
            clean = clean.split('```json')[1].split('```')[0].trim();
        } else if (clean.includes('```')) {
            clean = clean.split('```')[1].split('```')[0].trim();
        }

        // Extract JSON object
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        if (start === -1 || end === -1) return null;

        const jsonStr = clean.substring(start, end + 1);

        try {
            const parsed = JSON.parse(jsonStr);
            return this.normalizeExtractedAnswers(parsed);
        } catch (e) {
            return null;
        }
    }

    /**
     * Normalize AI output to match schema IDs
     */
    normalizeExtractedAnswers(data) {
        if (!data || !data.extractedAnswers) return data;

        const normalized = {};
        const source = data.extractedAnswers;

        // Common fuzzy value fixes
        const commonFixes = {
            'productGrid': 'product-grid',
            'modernMinimal': 'modern-minimal',
            'classicElegant': 'classic-elegant',
            'boldPlayful': 'bold-playful',
            'professionalCorporate': 'professional-corporate',
            'grid 3': 'grid-3',
            'grid 4': 'grid-4'
        };

        Object.keys(source).forEach(key => {
            let val = source[key];

            // Fix fuzzy values
            if (typeof val === 'string' && commonFixes[val]) {
                val = commonFixes[val];
            } else if (Array.isArray(val)) {
                val = val.map(v => commonFixes[v] || v);
            }

            normalized[key] = val;
        });

        return {
            ...data,
            extractedAnswers: normalized
        };
    }

    /**
     * General Assistant Chat
     * Used for the dashboard AI Assistant to perform actions
     */
    async assistantChat(messages, context = {}, provider = process.env.AI_PROVIDER || 'gemini') {
        const enrichedContext = this._buildRichContext(context);
        const systemPrompt = this._getSystemPrompt(enrichedContext);
        const model = provider === 'openai' ? 'gpt-4o' : 'gemini-2.0-flash';

        // Sanitize messages for LLM providers (remove extra fields like 'action')
        const sanitizedMessages = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        const performGeminiCall = async (retryCount = 0) => {
            try {
                if (!this.genAI) throw new AppError('Missing GEMINI_API_KEY', 500);
                const geminiModel = this.genAI.getGenerativeModel({ model });
                const prompt = `${systemPrompt}\n\nChat History:\n${sanitizedMessages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

                const result = await geminiModel.generateContent(prompt);
                const response = await result.response;

                let parsedData = this.safeParseJSON(response.text());

                // Fallback & Validation
                if (!parsedData) {
                    parsedData = { message: "I'm sorry, I couldn't process that. Could you try again?" };
                } else {
                    if (!parsedData.message) {
                        parsedData.message = parsedData.action ?
                            `I'll help you ${parsedData.action.type.replace(/_/g, ' ').toLowerCase()}.` :
                            "I'm listening. What would you like to do?";
                    }
                    if (parsedData.action) {
                        this._validateAction(parsedData.action, context);
                    }
                }

                this.logAction(context.user?.id, parsedData.action, { success: true });
                return { success: true, data: parsedData };

            } catch (error) {
                // Retry specific errors
                // Increase retries to 4 (approx 30s+ coverage) to handle 18s-60s quotas
                if ((error.status === 429 || error.message?.includes('429')) && retryCount < 4) {
                    // Backoff: 2s, 4s, 8s, 16s + jitter
                    const baseDelay = 2000;
                    const delay = (baseDelay * Math.pow(2, retryCount)) + (Math.random() * 1000);

                    console.log(`[AIService] Rate limit hit. Waiting ${Math.round(delay / 1000)}s before retry ${retryCount + 1}/4...`);

                    await new Promise(r => setTimeout(r, delay));
                    return performGeminiCall(retryCount + 1);
                }
                throw error;
            }
        };

        try {
            // Gemini Provider
            if (provider === 'gemini') {
                return await performGeminiCall();
            }

            // Groq Provider
            if (provider === 'groq') {
                if (!this.groq) {
                    return { success: false, error: 'Missing GROQ_API_KEY. Please add it to your .env file or switch to a different provider.' };
                }

                const completion = await this.groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...sanitizedMessages
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.1
                });

                const parsedData = this.safeParseJSON(completion.choices[0]?.message?.content);
                if (parsedData?.action) {
                    this._validateAction(parsedData.action, context);
                }
                this.logAction(context.user?.id, parsedData?.action, { success: true });
                return { success: true, data: parsedData };
            }

            // OpenAI Provider (fallback)
            if (!process.env.OPENAI_API_KEY) {
                return { success: false, error: 'Missing OPENAI_API_KEY. Please add it to your .env file or switch to a different provider.' };
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: systemPrompt }, ...sanitizedMessages], response_format: { type: 'json_object' } })
            });
            const data = await response.json();
            return { success: true, data: this.safeParseJSON(data.choices?.[0]?.message?.content) };
        } catch (error) {
            console.error('[AIService] Assistant Chat Error:', error.message);
            if (error.message?.includes('429')) {
                return { success: false, error: "I'm busy right now (Rate Limit). Please wait a moment." };
            }
            return { success: false, error: error.message };
        }
    }

    _buildRichContext(context) {
        const stores = context.stores || [];
        const richContext = (Array.isArray(stores) ? stores : []).map(s => {
            const productsList = Array.isArray(s.products) ? s.products :
                (s.products?.products && Array.isArray(s.products.products) ? s.products.products : []);
            const categoriesList = Array.isArray(s.categories) ? s.categories : [];
            const componentsList = Array.isArray(s.components) ? s.components : [];

            return `
        STORE: ${s.name} (ID: ${s.id})
        - Products: ${productsList.map(p => `${p.name} ($${p.price}) [ID: ${p.id}]`).join(', ')}
        - Categories: ${categoriesList.map(c => `${c.name} [ID: ${c.id}]`).join(', ')}
        - Components: ${componentsList.map(c => `${c.type} [ID: ${c.id}]`).join(', ')}
        `;
        }).join('\n');

        return `
        User ID: ${context.user?.id}
        ${richContext}
        `;
    }

    _getSystemPrompt(richContext) {
        return `You are a powerful Storely AI Assistant. You help store owners manage their business.
        
        CONTEXT:
        ${richContext}
        
        AVAILABLE TOOLS:
        1. UPDATE_STORE
           - Method: PUT
           - URL: /stores/:id
           - Description: Update store identity, branding, and contact info.
           - Optional Fields: ["name", "tagline", "description", "contact_email", "contact_phone", "address", "facebook_url", "instagram_url", "twitter_url", "linkedin_url", "tiktok_url", "settings"]
           - Specialized updates via "settings":
             - Change theme color: set data.settings.primaryColor to a hex code (e.g. #FF0000)
             - Update logo: set data.settings.logo_url to the image URL.
             - Toggle features: set data.settings.reviews_enabled, etc.
           - Rule: DO NOT overwrite settings. Preserve existing settings by only including the fields that need changing.

        2. CREATE_PRODUCT
           - Method: POST
           - URL: /products
           - Required: ["name", "price", "storeId"]
           - Optional: ["description", "categoryId", "stock"]

        3. UPDATE_PRODUCT
           - Method: PUT
           - URL: /products/:id
           - Optional: ["name", "price", "description", "stock", "categoryId"]

        4. DELETE_PRODUCT (Destructive)
           - Method: DELETE
           - URL: /products/:id

        5. CREATE_CATEGORY
           - Method: POST
           - URL: /categories
           - Required: ["name", "storeId", "slug"]
           - Rule: Generate a unique, URL-safe slug based on the name (lower case, hyphens instead of spaces).

        6. DELETE_CATEGORY (Destructive)
           - Method: DELETE
           - URL: /categories/:id

        7. UPDATE_CATEGORY
           - Method: PUT
           - URL: /categories/:id
           - Optional: ["name", "description", "slug"]

        8. LIST_PRODUCTS
           - Method: GET
           - URL: /products?storeId=:storeId
           - Purpose: Retrieve all products for a store (for analytics or review)

        9. GET_STORE_STATS
           - Method: GET
           - URL: /stores/:id/stats
           - Purpose: Get order count, revenue, product count

        10. BULK_UPDATE_PRODUCTS
            - Method: PUT
            - URL: /products/bulk
            - Required: ["storeId", "updates"]
            - updates format: [{ "id": "uuid", "price": 25 }, ...]

        11. UPDATE_COMPONENT_CONTENT
            - Method: PUT
            - URL: /stores/:id/components/:componentId
            - Purpose: Update specific component content.
            - SCENARIOS:
              - "Write About Us": Look for component with type='footer' in context. Update { "aboutText": "Generated text..." }.
              - "Update Hero": Look for type='hero'. Update { "title": "...", "subtitle": "..." }.

        12. SEARCH_IMAGES
            - Method: GET
            - URL: /media/search?query=:query
            - Purpose: Search for professional images/logos from the web.
            - Rule: Use this when a user says "I need a logo" or "Find me an image for X".
            - Example Query: "modern coffee shop logo", "elegant fashion background".
        
        RULES:
        1. ALWAYS return an array of "actions".
        2. For "About Us", find the footer component ID and use UPDATE_COMPONENT_CONTENT.
        3. For "Colors", use UPDATE_STORE with settings.primaryColor.
        4. NEVER use placeholder text like "example.com", "YOUR_NAME", or "URL HERE". 
        5. If the user asks for an image, logo, or icon and you don't have a URL, you MUST use the SEARCH_IMAGES tool first. Do NOT generate a placeholder URL.
        6. Return ONLY valid JSON.
        
        RESPONSE FORMAT (JSON ONLY):
        {
          "message": "Friendly confirmation or explanation",
          "actions": [
            {
              "type": "TOOL_NAME",
              "method": "HTTP_METHOD",
              "url": "TARGET_URL",
              "data": { "field": "value" },
              "requiresConfirmation": true,
              "destructive": boolean
            }
          ]
        }
        
        RULES:
        1. Replace :id placeholders with actual UUIDs from Context.
        2. If unsure which store/product, ask the user.
        3. For DESTRUCTIVE actions, always set "requiresConfirmation": true AND "destructive": true.
        4. If a user asks for multiple things (e.g., 'update store and add product'), return an array of actions.
        5. Use SEARCH_IMAGES when visual assets are needed.
        6. Return ONLY JSON.`;
    }

    _validateAction(action, context) {
        // 1. Structure validation
        if (!action.type || !action.method || !action.url) {
            throw new Error("Invalid action format: missing type, method, or url");
        }

        // 2. Placeholder check
        if (action.url.includes(':id') || action.url.includes(':store_id')) {
            throw new Error("AI failed to replace URL placeholders with actual IDs");
        }

        // 3. ID ownership validation (for PUT/DELETE)
        if (['PUT', 'DELETE'].includes(action.method.toUpperCase())) {
            const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi;
            const urlIds = action.url.match(uuidRegex) || [];

            const stores = context.stores || [];
            const userOwnedIds = new Set((Array.isArray(stores) ? stores : []).flatMap(s => {
                const pIds = Array.isArray(s.products) ? s.products.map(p => p.id) :
                    (s.products?.products ? s.products.products.map(p => p.id) : []);
                const cIds = Array.isArray(s.categories) ? s.categories.map(c => c.id) : [];

                return [s.id, ...pIds, ...cIds];
            }));

            for (const id of urlIds) {
                if (!userOwnedIds.has(id)) {
                    throw new Error(`Security: ID ${id} does not belong to this user`);
                }
            }
        }

        // 4. Auto-inject store_id for CREATE actions
        if (action.method.toUpperCase() === 'POST' && action.data) {
            const stores = context.stores || [];
            if (stores.length === 1 && !action.data.storeId && !action.data.store_id) {
                action.data.storeId = stores[0].id;
                action.data.store_id = stores[0].id; // For compatibility
                console.log(`[AIService] Auto-injected store IDs: ${stores[0].id}`);
            }
        }
    }

    logAction(userId, action, result) {
        if (process.env.AISERVICE_LOGS === 'true') {
            console.log(`[AI-AUDIT] User: ${userId} | Action: ${action?.type} | Success: ${result.success}`);
        }
    }
}

module.exports = AIService;
