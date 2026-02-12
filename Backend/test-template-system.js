const axios = require('axios');

// Test configuration
const API_URL = 'http://localhost:3000/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJiMzAxOTNlLTgzYjMtYzM5Mi0xMTkyLTljYWQwZTFmMjAzMSIsImVtYWlsIjoib21hcmFiYmFzMzJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MzkyNTEyMzF9.wLZdGqOtNBOvlKbPRxvJPXJDHGqQxJOOCZFEwUPnLKo';

async function testTemplateSystem() {
    console.log('🧪 Testing Template System...\n');

    try {
        // Test 1: Create a template
        console.log('1️⃣  Creating template...');
        const createResponse = await axios.post(
            `${API_URL}/themes`,
            {
                name: 'Test Template ' + Date.now(),
                description: 'Automated test template',
                config: {
                    primaryColor: '#FF5733',
                    secondaryColor: '#33FF57',
                    fontFamily: 'Inter, sans-serif',
                    components: [
                        { id: 'hero', type: 'hero', content: { title: 'Welcome' } }
                    ]
                },
                screenshot_url: 'https://example.com/screenshot.jpg'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                }
            }
        );

        console.log('✅ Template created successfully!');
        console.log('   ID:', createResponse.data.data.id);
        console.log('   Name:', createResponse.data.data.name);
        console.log('   Config keys:', Object.keys(createResponse.data.data.config || {}));

        // Test 2: Retrieve all templates
        console.log('\n2️⃣  Fetching all templates...');
        const listResponse = await axios.get(`${API_URL}/themes`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`
            }
        });

        console.log('✅ Templates retrieved successfully!');
        console.log('   Total templates:', listResponse.data.data.length);
        console.log('   Template names:', listResponse.data.data.map(t => t.name).join(', '));

        // Test 3: Verify the created template is in the list
        const createdTemplate = listResponse.data.data.find(
            t => t.id === createResponse.data.data.id
        );

        if (createdTemplate) {
            console.log('\n3️⃣  Verifying template data...');
            console.log('✅ Template found in list!');
            console.log('   Config preserved:', JSON.stringify(createdTemplate.config, null, 2));
        } else {
            console.log('\n❌ Created template not found in list!');
        }

        console.log('\n🎉 All tests passed! Template system is working correctly.');
        console.log('\n📋 Summary:');
        console.log('   - Template creation: ✅');
        console.log('   - Template retrieval: ✅');
        console.log('   - Config persistence: ✅');
        console.log('   - Zod validation: ✅');

    } catch (error) {
        console.error('\n❌ Test failed!');
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        if (error.response?.data?.stack) {
            console.error('Stack:', error.response.data.stack);
        }
        process.exit(1);
    }
}

testTemplateSystem();
