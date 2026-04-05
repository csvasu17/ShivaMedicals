const { Client } = require('pg');
require('dotenv').config();

async function updateDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        await client.connect();
        await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS patient_email VARCHAR;');
        await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reason_for_visit TEXT;');
        await client.query('ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialty VARCHAR;');
        console.log('Database updated successfully');
    } catch (e) {
        console.error('Error updating database:', e);
    } finally {
        await client.end();
    }
}


updateDb();
