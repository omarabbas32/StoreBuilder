const prisma = require('../src/db/prismaClient');

async function cleanup() {
    console.log('--- Starting Database Cleanup ---');

    try {
        const stores = await prisma.store.findMany();

        for (const store of stores) {
            let settingsStr = JSON.stringify(store.settings);

            if (settingsStr.includes('generated_image_url')) {
                console.log(`Cleaning store: ${store.name} (${store.id})`);

                // Comprehensive string replacement
                let cleanedStr = settingsStr.replace(/"generated_image_url"/g, 'null');
                cleanedStr = cleanedStr.replace(/generated_image_url/g, '');

                const cleanedSettings = JSON.parse(cleanedStr);

                await prisma.store.update({
                    where: { id: store.id },
                    data: { settings: cleanedSettings }
                });
                console.log('Successfully cleaned settings');
            }
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
        console.log('--- Cleanup Finished ---');
        process.exit(0);
    }
}

cleanup();
