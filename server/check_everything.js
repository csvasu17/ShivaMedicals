require('dotenv').config();
const db = require('./db');

async function checkEverything() {
    try {
        console.log('--- Checking Database for patient_email ---');

        // 1. Check Views
        const viewsRes = await db.query(`
            SELECT table_name, view_definition 
            FROM information_schema.views 
            WHERE table_schema = 'public' AND view_definition ILIKE '%patient_email%'
        `);
        console.log('Views with patient_email:', viewsRes.rows);

        // 2. Check Functions
        const funcsRes = await db.query(`
            SELECT proname, prosrc 
            FROM pg_proc 
            JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
            WHERE nspname = 'public' AND prosrc ILIKE '%patient_email%'
        `);
        console.log('Functions with patient_email:', funcsRes.rows);

        // 3. Check All Tables for the column (just to be 100% sure)
        const colsRes = await db.query(`
            SELECT table_name 
            FROM information_schema.columns 
            WHERE column_name = 'patient_email'
        `);
        console.log('Tables with patient_email column:', colsRes.rows);

        // 4. Check for any constraints
        const consRes = await db.query(`
            SELECT conname, pg_get_constraintdef(oid) as definition
            FROM pg_constraint 
            WHERE conrelid = 'bookings'::regclass AND pg_get_constraintdef(oid) ILIKE '%patient_email%'
        `);
        console.log('Constraints with patient_email:', consRes.rows);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkEverything();
