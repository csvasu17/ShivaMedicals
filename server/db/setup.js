const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
    const client1 = new Client({
        connectionString: 'postgres://postgres:admin@localhost:5432/postgres'
    });
    
    try {
        await client1.connect();
        await client1.query('CREATE DATABASE clinic_booking');
        console.log('Database created');
    } catch (e) {
        if (e.code === '42P04') {
            console.log('Database already exists');
        } else {
            console.error('Error creating database:', e);
            throw e;
        }
    } finally {
        await client1.end();
    }

    const client2 = new Client({
        connectionString: 'postgres://postgres:admin@localhost:5432/clinic_booking'
    });
    
    try {
        await client2.connect();
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        await client2.query(schema);
        console.log('Schema executed successfully');
    } catch (e) {
        console.error('Error executing schema:', e);
        throw e;
    } finally {
        await client2.end();
    }
}

setup().catch(console.error);
