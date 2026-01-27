const db = require('../config/database');
const userModel = require('../models/user.model');

const seed = async () => {
    console.log('Starting seeding...');

    try {
        // Create Admin
        const adminEmail = 'admin@storely.com';
        const existingAdmin = await userModel.findByEmail(adminEmail);

        if (!existingAdmin) {
            console.log('Creating admin user...');
            await userModel.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'adminpassword123',
                role: 'admin'
            });
            console.log('Admin user created.');
        } else {
            console.log('Admin user already exists.');
        }

        // Create Store Owner
        const ownerEmail = 'owner@storely.com';
        let owner = await userModel.findByEmail(ownerEmail);

        if (!owner) {
            console.log('Creating store owner user...');
            owner = await userModel.create({
                name: 'John Store Owner',
                email: ownerEmail,
                password: 'ownerpassword123',
                role: 'merchant'
            });
            console.log('Store owner user created.');
        } else {
            console.log('Store owner user already exists.');
        }

        // Create a Store for the owner
        const storeModel = require('../models/store.model');
        const existingStore = await storeModel.findBySlug('sample-store');

        if (!existingStore) {
            console.log('Creating sample store...');
            await storeModel.create({
                owner_id: owner.id,
                name: 'Sample Store',
                slug: 'sample-store',
                description: 'This is a sample store created during seeding.',
                settings: {
                    theme: 'default',
                    currency: 'USD'
                }
            });
            console.log('Sample store created.');
        } else {
            console.log('Sample store already exists.');
        }

        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Error during seeding:', err.message);
        process.exit(1);
    }

    process.exit(0);
};

seed();
