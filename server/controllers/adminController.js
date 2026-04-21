const db = require('../db');

exports.getBookings = async (req, res) => {
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
};

exports.updateBookingStatus = async (req, res) => {
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
};

exports.updatePaymentStatus = async (req, res) => {
    const { payment_status, remarks } = req.body;
    try {
        let query = 'UPDATE bookings SET ';
        const values = [];
        const updates = [];

        if (payment_status !== undefined) {
            values.push(payment_status);
            updates.push(`payment_status = $${values.length}`);
        }
        if (remarks !== undefined) {
            values.push(remarks);
            updates.push(`remarks = $${values.length}`);
        }

        if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });

        values.push(req.params.id);
        query += updates.join(', ') + ` WHERE id = $${values.length} RETURNING *`;
        
        const result = await db.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.callNext = async (req, res) => {
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
};

exports.getStaff = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, username, phone, role, is_active FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM doctors ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addStaff = async (req, res) => {
    const { name, username, password, phone, role } = req.body;
    try {
        const query = `
            INSERT INTO users (name, username, password, phone, role) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, name, username, phone, role, is_active
        `;
        const values = [name, username, password, phone, role || 'staff'];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username or phone already exists' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.addDoctor = async (req, res) => {
    const { name, type, specialty } = req.body;
    try {
        const query = `
            INSERT INTO doctors (name, type, specialty) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const values = [name, type || 'general', specialty];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStaff = async (req, res) => {
    const { id } = req.params;
    const { name, phone, role, password } = req.body;
    try {
        let query, values;
        if (password) {
            query = `
                UPDATE users 
                SET name = $1, phone = $2, role = $3, password = $4
                WHERE id = $5 
                RETURNING id, name, username, phone, role, is_active
            `;
            values = [name, phone, role, password, id];
        } else {
            query = `
                UPDATE users 
                SET name = $1, phone = $2, role = $3
                WHERE id = $4 
                RETURNING id, name, username, phone, role, is_active
            `;
            values = [name, phone, role, id];
        }
        const result = await db.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true, message: 'Staff deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { name, type, specialty } = req.body;
    try {
        const query = `
            UPDATE doctors 
            SET name = $1, type = $2, specialty = $3
            WHERE id = $4 
            RETURNING *
        `;
        const values = [name, type, specialty, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM doctors WHERE id = $1', [id]);
        res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get metadata of the booking to be deleted
        const bookingRes = await client.query(
            'SELECT session_id, booking_date, token_number FROM bookings WHERE id = $1',
            [id]
        );

        if (bookingRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Booking not found' });
        }

        const { session_id, booking_date, token_number } = bookingRes.rows[0];

        // 2. Delete the booking
        await client.query('DELETE FROM bookings WHERE id = $1', [id]);

        // 3. Reassign subsequent tokens
        await client.query(
            `UPDATE bookings 
             SET token_number = token_number - 1 
             WHERE session_id = $1 AND booking_date = $2 AND token_number > $3`,
            [session_id, booking_date, token_number]
        );

        // 4. Update estimated times for all bookings in this session/date after the deleted one
        const remainingBookings = await client.query(
            `SELECT id, token_number FROM bookings 
             WHERE session_id = $1 AND booking_date = $2 AND token_number >= $3
             ORDER BY token_number ASC`,
            [session_id, booking_date, token_number]
        );

        // We need start_time, end_time and max_tokens for this session to recalculate
        const sessionRes = await client.query('SELECT start_time, end_time, max_tokens FROM sessions WHERE id = $1', [session_id]);
        const { start_time, end_time, max_tokens } = sessionRes.rows[0];

        // Helper to convert HH:MM:SS to minutes since midnight
        function timeToMinutes(timeStr) {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        }

        // Helper to convert minutes to HH:MM:SS
        function minutesToTime(minutes) {
            const h = Math.floor(minutes / 60).toString().padStart(2, '0');
            const m = (minutes % 60).toString().padStart(2, '0');
            return `${h}:${m}:00`;
        }

        const startMins = timeToMinutes(start_time);
        const endMins = timeToMinutes(end_time);
        const totalDurationMins = endMins - startMins;
        const avgMinutesPerPatient = Math.max(1, Math.floor(totalDurationMins / max_tokens));

        for (const booking of remainingBookings.rows) {
            const estMins = startMins + ((booking.token_number - 1) * avgMinutesPerPatient);
            const estTime = minutesToTime(estMins);
            await client.query('UPDATE bookings SET estimated_time = $1 WHERE id = $2', [estTime, booking.id]);
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Booking deleted and tokens reassigned' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Delete booking transaction failed:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.updateBooking = async (req, res) => {
    const { id } = req.params;
    const { patient_name, patient_phone, patient_age_years, patient_age_months, patient_age_days, location, remarks } = req.body;
    
    if (!patient_name || !patient_phone || !location || patient_age_years === undefined || patient_age_months === undefined || patient_age_days === undefined) {
        return res.status(400).json({ error: 'Missing mandatory fields' });
    }

    try {
        const query = `
            UPDATE bookings 
            SET patient_name = $1, patient_phone = $2, patient_age_years = $3, patient_age_months = $4, patient_age_days = $5, location = $6, remarks = $7 
            WHERE id = $8 
            RETURNING *
        `;
        const values = [patient_name, patient_phone, patient_age_years, patient_age_months, patient_age_days, location, remarks || '', id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).json({ error: err.message });
    }
};
