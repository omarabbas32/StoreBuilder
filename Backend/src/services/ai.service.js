const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * AI Service for Groq integration
 */
class AIService {
    /**
     * Generate AI response for onboarding chat
     */
    async chat(messages, schema) {
        try {
            const systemPrompt = `You are a helpful AI assistant helping users create their online store. 
Your job is to ask questions one at a time and extract structured answers.

Here is the schema of questions you need to ask:
${JSON.stringify(schema.questions, null, 2)}

Rules:
1. Ask questions naturally and conversationally
2. Only ask ONE question at a time
3. Be friendly and encouraging
4. When user provides an answer, acknowledge it positively
5. Extract the answer in the correct format (text, color hex code, array for multi-select, etc.)
6. If user provides a color name, convert it to hex code
7. Keep responses concise and clear
8. IMPORTANT: You CANNOT launch the store yourself. Once you have all the information, tell the user that their store is "Ready to Launch" and they should click the "Launch Store" button or type "launch it".

Current conversation context: The user is creating a new store and you're gathering information.`;

            const response = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 500,
            });

            const aiMessage = response.choices[0]?.message?.content || 'Sorry, I had trouble generating a response.';

            // Now extract data from history to see what we've collected so far
            const extractedData = {};
            const extractionPromises = schema.questions.map(async (q) => {
                const result = await this.extractAnswer(messages, q.field, q.type);
                if (result.success) {
                    extractedData[q.field] = result.value;
                }
            });

            await Promise.all(extractionPromises);

            // Determine if the setup is complete (all required questions answered)
            const requiredFields = schema.questions.filter(q => q.required).map(q => q.field);
            const isComplete = requiredFields.every(field => extractedData[field]);

            return {
                success: true,
                message: aiMessage,
                extractedAnswers: extractedData,
                isComplete
            };
        } catch (error) {
            console.error('Groq AI Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to generate AI response'
            };
        }
    }

    /**
     * Extract structured answer from conversation
     */
    async extractAnswer(conversation, field, expectedType) {
        try {
            const extractionPrompt = `Based on this conversation, extract the user's answer for the field "${field}".
Expected type: ${expectedType}

Conversation:
${conversation.map(m => `${m.role}: ${m.content}`).join('\n')}

Return ONLY the extracted value in the correct format:
- For text: return the text value
- For color: return hex code (e.g., #ff0000)
- For single-select: return the option ID
- For multi-select: return comma-separated option IDs

If no clear answer, return "UNCLEAR"`;

            const response = await groq.chat.completions.create({
                messages: [
                    { role: 'user', content: extractionPrompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1,
                max_tokens: 100,
            });

            const extracted = response.choices[0]?.message?.content?.trim();

            if (extracted === 'UNCLEAR' || !extracted) {
                return { success: false, value: null };
            }

            // Parse based on type
            if (expectedType === 'multi-select') {
                return { success: true, value: extracted.split(',').map(v => v.trim()) };
            }

            return { success: true, value: extracted };
        } catch (error) {
            console.error('Answer extraction error:', error);
            return { success: false, value: null };
        }
    }
}

module.exports = new AIService();
