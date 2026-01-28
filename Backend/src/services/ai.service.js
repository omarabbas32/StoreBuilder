const Groq = require('groq-sdk');
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
}

module.exports = AIService;
