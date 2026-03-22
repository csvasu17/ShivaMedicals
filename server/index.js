const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const tokenService = require('./services/tokenService');

const app = express();
app.use(cors());
app.use(express.json());

// --- MOCK AUTHENTICATION ROUTINES ---
app.post('/api/auth/send-otp', (req, res) => {
    res.json({ success: true, message: 'OTP sent successfully' });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    if (otp === '123456') { 
        res.json({ token: 'mock-jwt-token', user: { phone } });
    } else {
        res.status(401).json({ error: 'Invalid OTP' });
    }
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if ((username === 'admin' && password === 'admin123') || (username === 'staff1' && password === 'staff123')) {
        res.json({ token: 'mock-admin-token', user: { username, role: username === 'admin' ? 'admin' : 'staff' } });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/auth/me', (req, res) => {
    res.json({ user: { phone: 'mock-phone' } });
});

// --- BOOKING (PATIENT) ROUTES ---
app.get('/api/doctors', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, type FROM doctors WHERE is_active = true');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sessions/:doctorId', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sessions WHERE doctor_id = $1 AND is_active = true', [req.params.doctorId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/availability', async (req, res) => {
    const { doctorId, sessionId, date } = req.query;
    try {
        const slots = await tokenService.getAvailableSlots(sessionId, date);
        const isOpen = await tokenService.isBookingOpen(sessionId, date);
        res.json({ availableSlots: slots, isOpen });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    const { patientName, phone, email, reasonForVisit, doctorId, sessionId, date } = req.body;
    try {
        const isOpen = await tokenService.isBookingOpen(sessionId, date);
        if (!isOpen) {
            return res.status(400).json({ error: 'Booking is not open for this session.' });
        }
        
        const slots = await tokenService.getAvailableSlots(sessionId, date);
        if (slots <= 0) {
            return res.status(400).json({ error: 'Session is fully booked.' });
        }

        const tokenNumber = await tokenService.getNextTokenNumber(sessionId, date);
        const estimatedTime = await tokenService.calculateEstimatedTime(sessionId, tokenNumber);
        
        const bookingRef = `CLN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const result = await db.query(
            `INSERT INTO bookings (booking_ref, patient_name, patient_phone, patient_email, reason_for_visit, doctor_id, session_id, booking_date, token_number, estimated_time) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [bookingRef, patientName, phone, email, reasonForVisit, doctorId, sessionId, date, tokenNumber, estimatedTime]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bookings/my', async (req, res) => {
    const phone = req.query.phone; 
    try {
        const result = await db.query(
            `SELECT b.*, d.name as doctor_name, s.session_type 
             FROM bookings b 
             JOIN doctors d ON b.doctor_id = d.id 
             JOIN sessions s ON b.session_id = s.id 
             WHERE b.patient_phone = $1 ORDER BY b.booking_date DESC`,
            [phone]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- QUEUE ROUTE (PUBLIC) ---
app.get('/api/queue/live/:sessionId/:date', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM bookings WHERE session_id = $1 AND booking_date = $2 AND status = 'called' ORDER BY token_number DESC LIMIT 1`,
            [req.params.sessionId, req.params.date]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/bookings', async (req, res) => {
    const { date, sessionId } = req.query;
    try {
        const query = `
            SELECT b.*, d.name as doctor_name 
            FROM bookings b 
            JOIN doctors d ON b.doctor_id = d.id 
            WHERE b.booking_date = $1 AND b.session_id = $2 
            ORDER BY b.token_number ASC
        `;
        const result = await db.query(query, [date, sessionId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/bookings/:id/status', async (req, res) => {
    const { status } = req.body; // 'called', 'completed', 'cancelled', 'no_show'
    try {
        const result = await db.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/queue/call-next', async (req, res) => {
    const { sessionId, date } = req.body;
    try {
        await db.query(`UPDATE bookings SET status = 'completed' WHERE session_id = $1 AND booking_date = $2 AND status = 'called'`, [sessionId, date]);
        
        const nextResult = await db.query(`
            SELECT id FROM bookings 
            WHERE session_id = $1 AND booking_date = $2 AND status = 'confirmed' 
            ORDER BY token_number ASC LIMIT 1
        `, [sessionId, date]);

        if (nextResult.rows.length > 0) {
            const nextId = nextResult.rows[0].id;
            await db.query(`UPDATE bookings SET status = 'called' WHERE id = $1`, [nextId]);
            res.json({ success: true, message: 'Called next token' });
        } else {
            res.json({ success: false, message: 'No more tokens in queue' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
