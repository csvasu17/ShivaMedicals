const db = require('../db');
const tokenService = require('../services/tokenService');

exports.getDoctors = async (req, res) => {
    const { date } = req.query;
    try {
        let query = 'SELECT id, name, type, specialty FROM doctors WHERE is_active = true';
        const params = [];

        if (date) {
            const dayOfWeek = new Date(date).getDay();
            query = `
                SELECT DISTINCT d.id, d.name, d.type, d.specialty 
                FROM doctors d
                JOIN sessions s ON d.id = s.doctor_id
                WHERE d.is_active = true 
                AND s.is_active = true
                AND (s.day_of_week = $1 OR s.day_of_week IS NULL)
            `;
            params.push(dayOfWeek);
        }

        const result = await db.query(query, params);
        const doctors = result.rows;

        // Custom sort: Dr. Anand first, then alphabetical
        doctors.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            const isAnandA = nameA.includes('anand');
            const isAnandB = nameB.includes('anand');

            if (isAnandA && !isAnandB) return -1;
            if (!isAnandA && isAnandB) return 1;
            return nameA.localeCompare(nameB);
        });

        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSessions = async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;
    try {
        let query = 'SELECT * FROM sessions WHERE doctor_id = $1 AND is_active = true';
        const params = [doctorId];
        
        if (date) {
            const dayOfWeek = new Date(date).getDay(); // 0 is Sunday
            query += ' AND (day_of_week = $2 OR day_of_week IS NULL)';
            params.push(dayOfWeek);
        }
        
        const result = await db.query(query, params);
        
        // If no sessions found for this specific date, try to suggest the next available one
        if (date && result.rows.length === 0) {
            const allSessionsRes = await db.query('SELECT DISTINCT day_of_week FROM sessions WHERE doctor_id = $1 AND is_active = true', [doctorId]);
            
            if (allSessionsRes.rows.length > 0) {
                const workingDays = new Set();
                let worksEveryDay = false;
                
                allSessionsRes.rows.forEach(s => {
                    if (s.day_of_week === null) worksEveryDay = true;
                    else workingDays.add(s.day_of_week);
                });

                // If they work every day but sessions are missing (unlikely, but for safety) 
                // or if they only work specific days, calculate next
                if (!worksEveryDay && workingDays.size > 0) {
                    const currentDt = new Date(date);
                    let found = false;
                    let daysToAdd = 1;
                    
                    // Search up to 7 days ahead
                    while (daysToAdd <= 7) {
                        const checkDt = new Date(date);
                        checkDt.setDate(checkDt.getDate() + daysToAdd);
                        if (workingDays.has(checkDt.getDay())) {
                            found = true;
                            return res.json({ 
                                sessions: [], 
                                nextAvailableDate: checkDt.toISOString().split('T')[0] 
                            });
                        }
                        daysToAdd++;
                    }
                }
            }
        }

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
    const { patientName, phone, patientAgeYears, patientAgeMonths, patientAgeDays, location, doctorId, sessionId, date } = req.body;
    
    // Validation
    if (!patientName || !phone || !doctorId || !sessionId || !date || !location || patientAgeYears === undefined || patientAgeMonths === undefined || patientAgeDays === undefined) {
        return res.status(400).json({ message: 'All fields including name, phone, age, location, and doctor/session are mandatory.', error: 'Missing mandatory fields' });
    }

    try {
        const { isExtra } = req.body;
        
        if (!isExtra) {
            const isOpen = await tokenService.isBookingOpen(sessionId, date);
            if (!isOpen) {
                return res.status(400).json({ message: 'Booking is not open for this session.', error: 'Booking is not open for this session.' });
            }
            
            const slots = await tokenService.getAvailableSlots(sessionId, date);
            if (slots <= 0) {
                return res.status(400).json({ message: 'Session is fully booked.', error: 'Session is fully booked.' });
            }
        }

        const tokenNumber = await tokenService.getNextTokenNumber(sessionId, date);
        const estimatedTime = await tokenService.calculateEstimatedTime(sessionId, tokenNumber);
        
        const bookingRef = `BK-${Date.now().toString().slice(-4)}${Math.floor(100000 + Math.random() * 899999)}`;

        const result = await db.query(
            `INSERT INTO bookings (booking_ref, patient_name, patient_phone, patient_age_years, patient_age_months, patient_age_days, location, doctor_id, session_id, booking_date, token_number, estimated_time) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [bookingRef, patientName, phone, patientAgeYears, patientAgeMonths, patientAgeDays, location, doctorId, sessionId, date, tokenNumber, estimatedTime]
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

exports.getNextQueue = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT token_number, patient_name FROM bookings 
             WHERE session_id = $1 AND booking_date = $2 AND status = 'confirmed' 
             ORDER BY token_number ASC LIMIT 3`,
            [req.params.sessionId, req.params.date]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        res.json({ message: 'Booking cancelled successfully.', booking: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
