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
        
        // 1. Add new columns
        await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS patient_age_days INT;');
        await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT \'pending\';');
        await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS remarks TEXT DEFAULT \'\';');
        
        // 2. Set default values for existing rows to satisfy NOT NULL constraints
        await client.query('UPDATE bookings SET patient_age_years = 0 WHERE patient_age_years IS NULL;');
        await client.query('UPDATE bookings SET patient_age_months = 0 WHERE patient_age_months IS NULL;');
        await client.query('UPDATE bookings SET patient_age_days = 0 WHERE patient_age_days IS NULL;');
        await client.query('UPDATE bookings SET payment_status = \'pending\' WHERE payment_status IS NULL;');
        await client.query("UPDATE bookings SET remarks = '' WHERE remarks IS NULL;");
        await client.query("UPDATE bookings SET location = 'Not specified' WHERE location IS NULL;");
        
        // 3. Apply NOT NULL constraints
        await client.query('ALTER TABLE bookings ALTER COLUMN patient_age_years SET NOT NULL;');
        await client.query('ALTER TABLE bookings ALTER COLUMN patient_age_months SET NOT NULL;');
        await client.query('ALTER TABLE bookings ALTER COLUMN patient_age_days SET NOT NULL;');
        await client.query('ALTER TABLE bookings ALTER COLUMN payment_status SET NOT NULL;');
        await client.query('ALTER TABLE bookings ALTER COLUMN remarks SET NOT NULL;');
        await client.query('ALTER TABLE bookings ALTER COLUMN location SET NOT NULL;');
        
        // 4. Remove email column
        await client.query('ALTER TABLE bookings DROP COLUMN IF EXISTS patient_email;');

        await client.query('ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialty VARCHAR;');
        
        console.log('Database updated successfully');
    } catch (e) {
        console.error('Error updating database:', e);
    } finally {
        await client.end();
    }
}


updateDb();
