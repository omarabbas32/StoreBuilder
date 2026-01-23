const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * AI Service Optimized for Token Efficiency and High Accuracy
 */
class AIService {
    /**
     * Generate AI response for onboarding chat using a unified JSON approach
     */
    async chat(messages, schema, initialProvider = process.env.AI_PROVIDER || 'openai') {
        const providers = [initialProvider, 'openrouter', 'groq'].filter((p, i, self) => self.indexOf(p) === i);
        let lastError = null;

        for (const provider of providers) {
            console.log(`[AI SERVICE] Attempting Chat with Provider: ${provider}`);
            try {
                // TOKEN OPTIMIZATION: Generate a "Minimal Schema" (strips descriptions/labels)
                const minimalSchema = schema.questions.map(q => ({
                    f: q.field,
                    t: q.type,
                    r: q.required,
                    o: q.options ? q.options.map(opt => opt.id) : undefined
                }));

                const systemPrompt = `You are a helpful AI store builder. Extract configuration from the chat.

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
3. If user choice is clear (e.g. "Classic & Elegant" -> "classic-elegant"), extract it. Do NOT ask for clarification.
4. "isComplete" = true if all r:true fields are present in extractedAnswers.
5. Use hex codes for brandColor.

CURRENT CONTEXT: Building store. Once a name is given, you can offer "Launch Store" with defaults.`;

                let responseData = null;
                const model = provider === 'openai' ? 'gpt-4o-mini' :
                    provider === 'groq' ? 'llama-3.3-70b-versatile' :
                        'google/gemini-2.0-flash-exp:free';

                if (provider === 'openai') {
                    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
                    const response = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.OPENAI_API_KEY.trim()}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": model,
                            "messages": [{ role: 'system', content: systemPrompt }, ...messages],
                            "response_format": { "type": "json_object" },
                            "temperature": 0.1
                        })
                    });
                    const data = await response.json();
                    if (data.error) throw new Error(`OpenAI Error: ${data.error.message}`);
                    responseData = this.safeParseJSON(data.choices?.[0]?.message?.content);
                } else if (provider === 'groq') {
                    if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
                    const response = await groq.chat.completions.create({
                        messages: [{ role: 'system', content: systemPrompt }, ...messages],
                        model: model,
                        temperature: 0.1,
                        response_format: { type: 'json_object' }
                    });
                    responseData = this.safeParseJSON(response.choices?.[0]?.message?.content);
                } else if (provider === 'openrouter') {
                    if (!process.env.OPENROUTER_API_KEY) throw new Error("Missing OPENROUTER_API_KEY");
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY.trim()}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": model,
                            "messages": [{ role: 'system', content: systemPrompt }, ...messages],
                            "temperature": 0.1
                        })
                    });
                    const data = await response.json();
                    if (data.error) throw new Error(`OpenRouter Error: ${data.error.message}`);
                    responseData = this.safeParseJSON(data.choices?.[0]?.message?.content);
                }

                if (responseData && responseData.message) {
                    console.log(`[AI SERVICE] Success with ${provider}`);
                    return {
                        success: true,
                        message: responseData.message,
                        extractedAnswers: responseData.extractedAnswers || {},
                        isComplete: !!responseData.isComplete,
                        providerUsed: provider
                    };
                }
            } catch (error) {
                console.error(`[AI SERVICE] Provider ${provider} failed:`, error.message);
                lastError = error;
            }
        }

        return {
            success: false,
            error: lastError?.message || 'All AI providers failed'
        };
    }

    /**
     * Resiliently parse JSON from LLM output
     */
    safeParseJSON(str) {
        if (!str) return null;
        let clean = str.trim();

        if (clean.includes('```json')) {
            clean = clean.split('```json')[1].split('```')[0].trim();
        } else if (clean.includes('```')) {
            clean = clean.split('```')[1].split('```')[0].trim();
        }

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
     * Normalize AI extracted data to match strict schema IDs
     */
    normalizeExtractedAnswers(data) {
        if (!data || !data.extractedAnswers) return data;

        const normalized = {};
        const source = data.extractedAnswers;

        // Common mapping for fuzzy AI output to strict IDs
        const commonFixes = {
            'productGrid': 'product-grid',
            'product-grid': 'product-grid',
            'modernMinimal': 'modern-minimal',
            'classicElegant': 'classic-elegant',
            'boldPlayful': 'bold-playful',
            'professionalCorporate': 'professional-corporate',
            'grid 3': 'grid-3',
            'grid 4': 'grid-4',
            'generalStore': 'general'
        };

        Object.keys(source).forEach(key => {
            let val = source[key];
            let finalKey = key;

            // Handle fuzzy values
            if (typeof val === 'string' && commonFixes[val]) {
                val = commonFixes[val];
            } else if (Array.isArray(val)) {
                val = val.map(v => commonFixes[v] || v);
            }

            // Normalizing common key variations
            if (finalKey === 'store_category' || finalKey === 'storeCategory') finalKey = 'storeCategory';
            if (finalKey === 'stylePreference' || finalKey === 'style_preference') finalKey = 'style_preference';
            if (finalKey === 'brand_color' || finalKey === 'brandColor') finalKey = 'brandColor';
            if (finalKey === 'enabled_sections' || finalKey === 'enabledSections') finalKey = 'enabledSections';

            normalized[finalKey] = val;
        });

        return {
            ...data,
            extractedAnswers: normalized
        };
    }

    /**
     * Legacy methods for compatibility
     */
    async extractAllAnswers(conversation, schema, provider = process.env.AI_PROVIDER || 'groq') {
        const result = await this.chat(conversation, schema, provider);
        return result.success ? result.extractedAnswers : {};
    }

    async extractAnswer(conversation, field, expectedType, provider = process.env.AI_PROVIDER || 'groq') {
        const all = await this.extractAllAnswers(conversation, { questions: [{ field, type: expectedType }] }, provider);
        return all[field] ? { success: true, value: all[field] } : { success: false };
    }
}

module.exports = new AIService();
