const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('CREATE TABLE IF NOT EXISTS doctor_types (id SERIAL PRIMARY KEY, name VARCHAR UNIQUE NOT NULL);')
  .then(() => pool.query(`INSERT INTO doctor_types (name) VALUES ('general'), ('child') ON CONFLICT DO NOTHING;`))
  .then(() => console.log('Table created successfully'))
  .catch(err => console.error(err))
  .finally(() => pool.end());
