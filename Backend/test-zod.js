const { z } = require('zod');

try {
    console.log('Testing Zod version...');
    const schema = z.object({
        name: z.string(),
        config: z.object({}).passthrough()
    });

    const data = {
        name: 'Test',
        config: { foo: 'bar' }
    };

    console.log('Running safeParse...');
    const result = schema.safeParse(data);
    console.log('Result:', result.success ? 'Success' : 'Fail');
    if (!result.success) console.log('Errors:', result.error.flatten());
} catch (error) {
    console.error('CRASHED:', error);
}
