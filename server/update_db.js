const { Client } = require('pg');

async function updateDb() {
    const client = new Client({
        connectionString: 'postgres://postgres:admin@localhost:5432/clinic_booking'
    });
    
    try {
        await client.connect();
        await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS patient_email VARCHAR;');
        await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reason_for_visit TEXT;');
        console.log('Database updated successfully');
    } catch (e) {
        console.error('Error updating database:', e);
    } finally {
        await client.end();
    }
}

updateDb();
