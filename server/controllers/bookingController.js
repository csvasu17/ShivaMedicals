const db = require('../db');
const tokenService = require('../services/tokenService');

exports.getDoctors = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, type, specialty FROM doctors WHERE is_active = true');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sessions WHERE doctor_id = $1 AND is_active = true', [req.params.doctorId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAvailability = async (req, res) => {
    const { doctorId, sessionId, date } = req.query;
    try {
        const slots = await tokenService.getAvailableSlots(sessionId, date);
        const isOpen = await tokenService.isBookingOpen(sessionId, date);
        res.json({ availableSlots: slots, isOpen });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createBooking = async (req, res) => {
    const { patientName, phone, email, reasonForVisit, doctorId, sessionId, date } = req.body;
    console.log('[BOOKING REQUEST]', req.body);
    try {
        const isOpen = await tokenService.isBookingOpen(sessionId, date);
        if (!isOpen) {
            console.log('[BOOKING REJECTED] Not open:', { sessionId, date });
            return res.status(400).json({ message: 'Booking is not open for this session.', error: 'Booking is not open for this session.' });
        }
        
        const slots = await tokenService.getAvailableSlots(sessionId, date);
        if (slots <= 0) {
            console.log('[BOOKING REJECTED] No slots:', { sessionId, date });
            return res.status(400).json({ message: 'Session is fully booked.', error: 'Session is fully booked.' });
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
};

exports.getMyBookings = async (req, res) => {
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
};

exports.getLiveQueue = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM bookings WHERE session_id = $1 AND booking_date = $2 AND status = 'called' ORDER BY token_number DESC LIMIT 1`,
            [req.params.sessionId, req.params.date]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
