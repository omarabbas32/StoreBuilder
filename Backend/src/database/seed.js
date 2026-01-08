const db = require('../config/database');
const User = require('../models/User');

const seed = async () => {
    console.log('Starting seeding...');

    try {
        // Create Admin
        const adminEmail = 'admin@storely.com';
        const existingAdmin = await User.findByEmail(adminEmail);

        if (!existingAdmin) {
            console.log('Creating admin user...');
            await User.create({
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
        let owner = await User.findByEmail(ownerEmail);

        if (!owner) {
            console.log('Creating store owner user...');
            owner = await User.create({
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
        const Store = require('../models/Store');
        const existingStore = await Store.findBySlug('sample-store');

        if (!existingStore) {
            console.log('Creating sample store...');
            await Store.create({
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
