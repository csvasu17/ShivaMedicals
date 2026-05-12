require('dotenv').config();
const db = require('./db');

async function seed() {
    try {
        console.log('Starting seed process...');

        // 1. Create Staff Members if they don't exist
        const staffMembers = [
            { name: 'Rahul Kumar', username: 'rahul', password: 'password123', phone: '9876543210', role: 'receptionist' },
            { name: 'Priya Sharma', username: 'priya', password: 'password123', phone: '9876543211', role: 'staff' },
            { name: 'Amit Singh', username: 'amit', password: 'password123', phone: '9876543212', role: 'staff' }
        ];

        const createdStaffIds = [];

        for (const staff of staffMembers) {
            const checkUser = await db.query('SELECT id FROM users WHERE username = $1', [staff.username]);
            if (checkUser.rows.length === 0) {
                const res = await db.query(
                    'INSERT INTO users (name, username, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [staff.name, staff.username, staff.password, staff.phone, staff.role]
                );
                createdStaffIds.push(res.rows[0].id);
                console.log(`Created staff: ${staff.name}`);
            } else {
                createdStaffIds.push(checkUser.rows[0].id);
                console.log(`Staff already exists: ${staff.name}`);
            }
        }

        // 2. Create Attendance Records
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const attendanceData = [
            // Yesterday (All Present)
            { userId: createdStaffIds[0], date: yesterday, status: 'present', checkIn: `${yesterday}T09:00:00`, checkOut: `${yesterday}T17:00:00`, notes: 'On time' },
            { userId: createdStaffIds[1], date: yesterday, status: 'present', checkIn: `${yesterday}T09:15:00`, checkOut: `${yesterday}T17:05:00`, notes: '' },
            { userId: createdStaffIds[2], date: yesterday, status: 'present', checkIn: `${yesterday}T08:55:00`, checkOut: `${yesterday}T16:50:00`, notes: '' },
            
            // Today
            { userId: createdStaffIds[0], date: today, status: 'present', checkIn: `${today}T08:50:00`, checkOut: null, notes: 'Early arrival' },
            { userId: createdStaffIds[1], date: today, status: 'absent', checkIn: null, checkOut: null, notes: 'No information' },
            { userId: createdStaffIds[2], date: today, status: 'leave', checkIn: null, checkOut: null, notes: 'Family emergency' }
        ];

        for (const record of attendanceData) {
            await db.query(
                `INSERT INTO attendance (user_id, date, status, check_in, check_out, notes) 
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (user_id, date) DO NOTHING`,
                [record.userId, record.date, record.status, record.checkIn, record.checkOut, record.notes]
            );
        }

        console.log('Attendance records seeded successfully');
        console.log('Seed process completed successfully');
    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        process.exit(0);
    }
}

seed();
