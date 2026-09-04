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
        let query;
        const params = [doctorId];
        
        if (date) {
            const dayOfWeek = new Date(date).getDay(); // 0 is Sunday
            query = `
                SELECT s.*, COALESCE(sr.restriction_type, 'none') as restriction_type 
                FROM sessions s
                LEFT JOIN session_restrictions sr ON s.id = sr.session_id AND sr.restriction_date = $2
                WHERE s.doctor_id = $1 AND s.is_active = true AND (s.day_of_week = $3 OR s.day_of_week IS NULL)
            `;
            params.push(date);
            params.push(dayOfWeek);
        } else {
            query = `
                SELECT s.*, 'none' as restriction_type 
                FROM sessions s
                WHERE s.doctor_id = $1 AND s.is_active = true
            `;
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
        
        // Check session-level booking restrictions
        const settingsRes = await db.query(
            "SELECT restriction_type FROM session_restrictions WHERE session_id = $1 AND restriction_date = $2",
            [sessionId, date]
        );
        const restriction = settingsRes.rows[0]?.restriction_type || 'none';

        if (restriction === 'all') {
            return res.status(400).json({ message: 'Booking is currently closed.', error: 'Booking is currently closed.' });
        }

        if (restriction === 'guest') {
            const authHeader = req.headers.authorization;
            const isStaff = authHeader && authHeader.startsWith('Bearer ');
            if (!isStaff) {
                return res.status(400).json({ message: 'Booking is currently unavailable.', error: 'Booking is currently unavailable.' });
            }
        }
        
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
        const estimatedTime = await tokenService.calculateEstimatedTime(sessionId, tokenNumber, date, db);
        
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

exports.getLiveBoard = async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date required' });
    try {
        const dayOfWeek = new Date(date).getDay();

        const doctorsResult = await db.query(
            `SELECT DISTINCT d.id, d.name, d.type, d.specialty
             FROM doctors d
             JOIN sessions s ON d.id = s.doctor_id
             WHERE d.is_active = true AND s.is_active = true
             AND (s.day_of_week = $1 OR s.day_of_week IS NULL)`,
            [dayOfWeek]
        );

        const doctors = doctorsResult.rows;
        doctors.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            const isAnandA = nameA.includes('anand');
            const isAnandB = nameB.includes('anand');
            if (isAnandA && !isAnandB) return -1;
            if (!isAnandA && isAnandB) return 1;
            return nameA.localeCompare(nameB);
        });

        if (doctors.length === 0) return res.json([]);

        const doctorIds = doctors.map(d => d.id);

        const sessionsResult = await db.query(
            `SELECT * FROM sessions
             WHERE doctor_id = ANY($1) AND is_active = true
             AND (day_of_week = $2 OR day_of_week IS NULL)`,
            [doctorIds, dayOfWeek]
        );

        const sessionIds = sessionsResult.rows.map(s => s.id);

        const [liveResult, nextResult] = await Promise.all([
            db.query(
                `SELECT DISTINCT ON (session_id) session_id, token_number, patient_name
                 FROM bookings
                 WHERE session_id = ANY($1) AND booking_date = $2 AND status = 'called'
                 ORDER BY session_id, token_number DESC`,
                [sessionIds, date]
            ),
            db.query(
                `SELECT session_id, token_number, patient_name
                 FROM (
                   SELECT session_id, token_number, patient_name,
                          ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY token_number ASC) AS rn
                   FROM bookings
                   WHERE session_id = ANY($1) AND booking_date = $2 AND status = 'confirmed'
                 ) ranked WHERE rn <= 3`,
                [sessionIds, date]
            )
        ]);

        const liveMap = {};
        liveResult.rows.forEach(r => { liveMap[r.session_id] = r; });

        const nextMap = {};
        nextResult.rows.forEach(r => {
            if (!nextMap[r.session_id]) nextMap[r.session_id] = [];
            nextMap[r.session_id].push({ token_number: r.token_number, patient_name: r.patient_name });
        });

        const sessMap = {};
        sessionsResult.rows.forEach(s => {
            if (!sessMap[s.doctor_id]) sessMap[s.doctor_id] = [];
            sessMap[s.doctor_id].push(s);
        });

        const payload = doctors.map(doc => {
            const sessions = (sessMap[doc.id] || []).map(sess => ({
                id: sess.id,
                label: sess.session_type,
                start: sess.start_time?.slice(0, 5) || '--:--',
                token: liveMap[sess.id]?.token_number || null,
                patientName: liveMap[sess.id]?.patient_name || null,
                nextPatients: nextMap[sess.id] || []
            }));
            return { ...doc, sessions };
        });

        res.json(payload);
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

exports.getSystemSettings = async (req, res) => {
    try {
        const result = await db.query("SELECT value FROM system_settings WHERE key = 'booking_restriction'");
        const booking_restriction = result.rows[0]?.value || 'none';
        res.json({ booking_restriction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSessionRestriction = async (req, res) => {
    const { sessionId } = req.params;
    const { date } = req.query;
    if (!sessionId || !date) {
        return res.status(400).json({ error: 'sessionId and date are required' });
    }
    try {
        const result = await db.query(
            "SELECT restriction_type FROM session_restrictions WHERE session_id = $1 AND restriction_date = $2",
            [sessionId, date]
        );
        const booking_restriction = result.rows[0]?.restriction_type || 'none';
        res.json({ booking_restriction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
