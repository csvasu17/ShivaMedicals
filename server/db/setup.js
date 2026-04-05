const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setup() {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        console.error('DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        await client.connect();
        
        // Check if we can read the schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf-8');
            await client.query(schema);
            console.log('Schema executed successfully (tables created/verified)');
        } else {
            console.warn('schema.sql not found, skipping schema execution');
        }
        
    } catch (e) {
        console.error('Error during setup:', e);
        throw e;
    } finally {
        await client.end();
    }
}

setup().catch(console.error);

