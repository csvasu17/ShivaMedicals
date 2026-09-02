const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

async function updateDb() {
    try {
        console.log('Starting database update...');
        
        // 1. Add new columns
        await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS patient_age_days INT;');
        await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT \'pending\';');
        await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS remarks TEXT DEFAULT \'\';');
        await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_checked_in BOOLEAN DEFAULT false;');
        await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE;');
        await db.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_remark VARCHAR(100);');
        
        // 2. Set default values for existing rows to satisfy NOT NULL constraints
        await db.query('UPDATE bookings SET patient_age_years = 0 WHERE patient_age_years IS NULL;');
        await db.query('UPDATE bookings SET patient_age_months = 0 WHERE patient_age_months IS NULL;');
        await db.query('UPDATE bookings SET patient_age_days = 0 WHERE patient_age_days IS NULL;');
        await db.query('UPDATE bookings SET payment_status = \'pending\' WHERE payment_status IS NULL;');
        await db.query("UPDATE bookings SET remarks = '' WHERE remarks IS NULL;");
        await db.query("UPDATE bookings SET location = 'Not specified' WHERE location IS NULL;");
        
        // 3. Apply NOT NULL constraints
        await db.query('ALTER TABLE bookings ALTER COLUMN patient_age_years SET NOT NULL;');
        await db.query('ALTER TABLE bookings ALTER COLUMN patient_age_months SET NOT NULL;');
        await db.query('ALTER TABLE bookings ALTER COLUMN patient_age_days SET NOT NULL;');
        await db.query('ALTER TABLE bookings ALTER COLUMN payment_status SET NOT NULL;');
        await db.query('ALTER TABLE bookings ALTER COLUMN remarks SET NOT NULL;');
        await db.query('ALTER TABLE bookings ALTER COLUMN location SET NOT NULL;');
        
        // 4. Remove email column
        await db.query('ALTER TABLE bookings DROP COLUMN IF EXISTS patient_email;');

        await db.query('ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialty VARCHAR;');
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;');
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL;');
        
        // Create staff attendance table
        await db.query(`
            CREATE TABLE IF NOT EXISTS staff_attendance (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'half_morning', 'half_evening')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(staff_id, date)
            );
        `);

        // Create system settings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR PRIMARY KEY,
                value VARCHAR NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed default booking_restriction setting if not exists
        await db.query(`
            INSERT INTO system_settings (key, value)
            VALUES ('booking_restriction', 'none')
            ON CONFLICT (key) DO NOTHING;
        `);

        // Create session restrictions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS session_restrictions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
                restriction_date DATE NOT NULL,
                restriction_type VARCHAR(20) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(session_id, restriction_date)
            );
        `);
        
        console.log('Database updated successfully');
    } catch (e) {
        console.error('Error updating database:', e);
    } finally {
        process.exit(0);
    }
}


updateDb();
