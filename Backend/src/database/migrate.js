const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const runMigrations = async () => {
    try {
        // Create migrations table if not exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT NOW()
            )
        `);

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

        console.log('Starting migrations...');

        for (const file of files) {
            // Check if migration already executed
            const { rows } = await db.query('SELECT * FROM migrations WHERE name = $1', [file]);
            if (rows.length > 0) {
                console.log(`Migration ${file} already executed, skipping.`);
                continue;
            }

            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`Executing migration: ${file}`);
            await db.query(sql);

            // Record migration
            await db.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
            console.log(`Migration ${file} completed successfully.`);
        }

        console.log('All migrations completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error during migrations:', err.message);
        process.exit(1);
    }
};

runMigrations();
