require('dotenv').config();
const db = require('./db');

console.log("DB URL from env:", process.env.DATABASE_URL);

db.query('SELECT id, name FROM doctors')
  .then(res => console.log('Query success:', res.rows))
  .catch(e => console.error('Connection error:', e))
  .finally(() => process.exit(0));
