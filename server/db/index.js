const { Pool } = require('pg');

console.log('Connecting to database using:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// the pool will emit an error on behalf of any idle client
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client:', err);
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('DATABASE CONNECTION ERROR:', err.message);
    console.error('Stack:', err.stack);
    return;
  }
  console.log('Successfully connected to database');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};



