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

        const systemPrompt = `You are Storely's Expert Onboarding Assistant. Your persona is professional, encouraging, and highly efficient.
        
        GOAL: Guide the user to set up their perfect online store through a natural, one-question-at-a-time conversation.
        
        EXTRACTION RULES:
        - Use the MINIMAL SCHEMA below to identify fields (f=field, t=type, r=required, o=options).
        - If the user provides multiple pieces of info (e.g., name and style), extract ALL of them.
        - For options (o), you MUST return the EXACT ID (e.g., "modern-minimal", not "Modern Minimal").
        - For hex colors, always provide a valid hex code (e.g., "#2563eb").
        
        SCHEMA:
        ${JSON.stringify(minimalSchema)}
        
        RESPONSE REQUIREMENTS (JSON ONLY):
        {
          "message": "A warm, helpful response. Acknowledge what was learned, then ask for EXACTLY ONE missing required field.",
          "extractedAnswers": { "field": "value" },
          "isComplete": false
        }
        
        CRITICAL RULES:
        1. "isComplete": true ONLY when ALL r:true (required) fields are in extractedAnswers.
        2. Never ask more than one question at a time.
        3. Keep the tone premium and inspiring.
        4. No markdown formatting in the 'message' field, just plain text.`;

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
            const model = 'gemini-2.0-flash';

            try {
                if (!this.genAI) throw new AppError('Missing GEMINI_API_KEY', 500);
                const geminiModel = this.genAI.getGenerativeModel({ model });
                const prompt = `${systemPrompt}\n\nChat History:\n${sanitizedMessages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

                const result = await geminiModel.generateContent(prompt);
                const response = await result.response;

                let parsedData = this.safeParseJSON(response.text());

                if (!parsedData) {
                    parsedData = { message: "I'm processing your request, but the response was formatted unexpectedly. Could you rephrase your last request?" };
                } else {
                    if (!parsedData.message) {
                        parsedData.message = parsedData.action ?
                            `I'll help you ${parsedData.action.type.replace(/_/g, ' ').toLowerCase()}.` :
                            "I'm here to help. What should we work on next?";
                    }
                    if (parsedData.action) {
                        this._validateAction(parsedData.action, context);
                    }
                }

                this.logAction(context.user?.id, parsedData.action, { success: true });
                return { success: true, data: parsedData };

            } catch (error) {
                const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('usage limit');

                if (isRateLimit && retryCount < 3) {
                    const baseDelay = 3000;
                    const delay = (baseDelay * Math.pow(2, retryCount)) + (Math.random() * 1000);

                    console.log(`[AIService] Gemini rate limit. Retrying in ${Math.round(delay / 1000)}s...`);

                    await new Promise(r => setTimeout(r, delay));
                    return performGeminiCall(retryCount + 1);
                }
                throw error;
            }
        };

        try {
            // Attempt Gemini first if selected
            if (provider === 'gemini') {
                try {
                    return await performGeminiCall();
                } catch (error) {
                    console.warn(`[AIService] Gemini failed (${error.message}). Attempting fallback to Groq...`);
                    provider = 'groq'; // Set to Groq for the catch block below
                }
            }

            // Groq Provider (Explicit or Fallback)
            if (provider === 'groq') {
                if (!this.groq) {
                    return { success: false, error: 'AI is currently unavailable. Please check your API keys.' };
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

            // OpenAI Provider (manual select only)
            if (provider === 'openai') {
                if (!process.env.OPENAI_API_KEY) {
                    return { success: false, error: 'OpenAI API key missing.' };
                }

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: systemPrompt }, ...sanitizedMessages], response_format: { type: 'json_object' } })
                });
                const data = await response.json();
                return { success: true, data: this.safeParseJSON(data.choices?.[0]?.message?.content) };
            }

            return { success: false, error: 'No valid AI provider configured.' };

        } catch (error) {
            console.error('[AIService] Assistant Chat Fatal Error:', error.message);
            return { success: false, error: `I'm having trouble connecting to my brain right now. Please try again in 10 seconds.` };
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
        STORE Identity: ${s.name} [Store ID: ${s.id}]
        - Tagline: ${s.tagline || 'None'}
        - Description: ${s.description || 'None'}
        - Contact: ${s.contact_email || 'None'}, ${s.contact_phone || 'None'}
        - Address: ${s.address || 'None'}
        - Socials: FB: ${s.facebook_url || 'None'}, IG: ${s.instagram_url || 'None'}, TW: ${s.twitter_url || 'None'}, LI: ${s.linkedin_url || 'None'}, TT: ${s.tiktok_url || 'None'}
        - Categories Available: ${categoriesList.map(c => `${c.name} [ID: ${c.id}]`).join(', ')}
        - Existing Products: ${productsList.map(p => `${p.name} ($${p.price}) [ID: ${p.id}]`).join(', ')}
        - Page Components: ${componentsList.map(c => `${c.type} [ID: ${c.id}]`).join(', ')}
        `;
        }).join('\n');

        return `
        User ID: ${context.user?.id}
        ${richContext}
        `;
    }

    _getSystemPrompt(richContext) {
        return `You are the Storely Intelligence Engine, a high-level business assistant for e-commerce owners.
        
        CORE PERSONA:
        - Precise, analytical, and proactive.
        - You don't just "do tasks"; you provide business value.
        - You always explain the reasoning behind your actions.
        
        BUSINESS CONTEXT:
        ${richContext}
        
        AVAILABLE TOOLS & PROTOCOLS:
        
        1. UPDATE_STORE
           - Method: PUT
           - URL: /stores/:id
           - Purpose: Update store identity, branding, and global settings
           - Optional Fields: ["name", "slug", "tagline", "description", "contact_email", "contact_phone", "address", "facebook_url", "instagram_url", "twitter_url", "linkedin_url", "tiktok_url", "settings", "business_hours"]
           - Settings Protocol: 
             * Change theme color: { "settings": { "primaryColor": "#HEX_CODE" } }
             * Update logo: { "settings": { "logo_url": "URL" } }
             * Update background: { "settings": { "background_url": "URL" } }
             * Toggle features: { "settings": { "reviews_enabled": boolean } }
             * Change Typography: { "settings": { "font_family": "string" } }
             * Product Grid Columns: { "settings": { "product_grid_columns": number } }
           - CRITICAL: Only include fields that are changing, preserve all other settings. You have access to ALL store fields, if the user asks for a customization not explicitly listed here, try to find a logical field in the store model to update.
        
        2. CREATE_PRODUCT
           - Method: POST
           - URL: /products
           - Required: ["name", "price", "storeId"]
           - Optional: ["description", "stock", "categoryId"]
        
        3. UPDATE_PRODUCT
           - Method: PUT
           - URL: /products/:id
           - Optional: ["name", "price", "description", "stock", "categoryId", "images"]
        
        4. DELETE_PRODUCT
           - Method: DELETE
           - URL: /products/:id
           - DESTRUCTIVE: Always set requiresConfirmation=true and destructive=true
        
        5. CREATE_CATEGORY
           - Method: POST
           - URL: /categories
           - Fields: ["name", "slug", "description", "image_url", "storeId", "parentId"]
           - Slug Protocol: Generate URL-safe slug (lowercase, hyphens instead of spaces)
        
        6. DELETE_CATEGORY
           - Method: DELETE
           - URL: /categories/:id
           - DESTRUCTIVE: Always set requiresConfirmation=true and destructive=true
        
        7. UPDATE_CATEGORY
           - Method: PUT
           - URL: /categories/:id
           - Optional: ["name", "slug", "description", "image_url", "parentId"]
        
        8. LIST_PRODUCTS
           - Method: GET
           - URL: /products?storeId=:storeId
           - Purpose: Retrieve all products for analytics or review
        
        9. GET_STORE_STATS
           - Method: GET
           - URL: /stores/:id/stats
           - Purpose: Get order count, revenue, product count
        
        10. BULK_UPDATE_PRODUCTS
            - Method: PUT
            - URL: /products/bulk
            - Required: ["storeId", "updates"]
            - Updates Format: [{ "id": "uuid", "price": 25 }, ...]
        
        11. UPDATE_COMPONENT_CONTENT
            - Method: PUT
            - URL: /stores/:id/components/:componentId
            - Purpose: Update specific page component content
            - Common Scenarios:
              * Hero update: Find type='hero', update { "title": "...", "subtitle": "...", "image": "URL" }
              * Footer About Us: Find type='footer', update { "aboutText": "..." }
            - Image Protocol: When setting hero image, MUST include { "useGradient": false } or image will be hidden
        
        12. SEARCH_IMAGES
            - Method: GET
            - URL: /media/search?query=:query
            - Purpose: Find professional stock photography
            - Use When: User says "find me an image" or "I need a photo"
        
        13. GENERATE_IMAGE
            - Method: GET
            - URL: /media/generate?prompt=:prompt
            - Purpose: Create AI-generated custom assets
            - Use When: User says "generate", "create", or "make" a custom image/logo/visual
            - PROMPT ENGINEERING PROTOCOL:
              * Style: Include "minimalist 3D render", "photorealistic", "flat design", "isometric view"
              * Lighting: Specify "soft studio lighting", "dramatic shadows", "natural daylight"
              * Context: Add "on white background", "with subtle gradients", "professional product shot"
              * Example: "A minimalist 3D render of a tech store logo with soft studio lighting on white background"
            - CRITICAL WORKFLOW:
              1. This action ONLY presents image options to the user
              2. DO NOT include UPDATE_STORE or UPDATE_COMPONENT_CONTENT in the same response
              3. Wait for user to select an image before applying it
              4. Disclose the prompt in your message: "I've designed this prompt: '[PROMPT_TEXT]'"
        
        IMAGE APPLICATION PROTOCOL (After User Confirms Selection):
        - When user says "use this image: [URL]" or "set it as my [asset_type]":
          1. Identify asset type:
             * Logo → UPDATE_STORE with { "settings": { "logo_url": "URL" } }
             * Background → UPDATE_STORE with { "settings": { "background_url": "URL" } }
             * Hero/Cover → UPDATE_COMPONENT_CONTENT with { "image": "URL", "useGradient": false }
          2. Find correct component ID from context (for hero/cover)
          3. Confirm action in message: "Setting this as your [asset_type]"
        
        OPERATIONAL RULES:
        1. CHAIN OF THOUGHT: Use the "message" field to explain your understanding of the user's business and why the selected actions are optimal.
        2. NO HALLUCINATION: If an ID or URL is missing, ASK. Never make up UUIDs.
        3. ASSET APPLICATION: Only apply images/logos to the store AFTER the user confirms a choice from a previous SEARCH or GENERATE result.
        4. ATOMICITY: Perform multi-step updates (e.g., update price AND stock) in a single request by including multiple actions.
        
        RESPONSE FORMAT (JSON ONLY):
        {
          "message": "Strategic thinking and action summary.",
          "actions": [
            {
              "type": "TOOL_NAME",
              "method": "HTTP_METHOD",
              "url": "TARGET_URL",
              "data": { "key": "value" },
              "requiresConfirmation": boolean,
              "destructive": boolean
            }
          ]
        }
        
        FINAL INSTRUCTION: Replace :id and :storeId placeholders with real UUIDs from the context provided above.`;
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
                console.log(`[AIService] Auto - injected store IDs: ${stores[0].id} `);
            }
        }
    }

    logAction(userId, action, result) {
        if (process.env.AISERVICE_LOGS === 'true') {
            console.log(`[AI - AUDIT] User: ${userId} | Action: ${action?.type} | Success: ${result.success} `);
        }
    }
}

module.exports = AIService;
