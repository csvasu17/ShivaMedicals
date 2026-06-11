const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../db');

async function run() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const res = await db.query('SELECT id, patient_name, token_number, status, booking_date FROM bookings ORDER BY booking_date DESC, token_number ASC LIMIT 10');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
