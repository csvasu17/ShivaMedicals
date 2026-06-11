const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

async function run() {
  try {
    const res = await db.query('SELECT * FROM doctors');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
