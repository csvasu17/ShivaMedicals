const db = require('../db');
const tokenService = require('../services/tokenService');

exports.getBookings = async (req, res) => {
    const { date, sessionId } = req.query;
    try {
        // Auto-assign NO-SHOW if patient has not checked in and current time > Est. Arrival Time + 90 mins (for today's session)
        if (date && sessionId) {
            try {
                await db.query(`
                    UPDATE bookings 
                    SET status = 'no_show' 
                    WHERE booking_date = $1 
                      AND session_id = $2 
                      AND status = 'confirmed' 
                      AND (is_checked_in = false OR is_checked_in IS NULL)
                      AND booking_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
                      AND (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') > ((booking_date + estimated_time) + INTERVAL '90 minutes')
                `, [date, sessionId]);
            } catch (autoErr) {
                console.error('Error auto-updating no-show status:', autoErr);
            }
        }

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

exports.checkInBooking = async (req, res) => {
    const { payment_status, payment_remark, remarks } = req.body;
    try {
        const result = await db.query(`
            UPDATE bookings 
            SET status = 'confirmed',
                is_checked_in = true, 
                check_in_time = CURRENT_TIMESTAMP, 
                payment_status = COALESCE($1, payment_status), 
                payment_remark = $2, 
                remarks = COALESCE($3, remarks)
            WHERE id = $4 
            RETURNING *
        `, [payment_status || 'pending', payment_remark || 'Paid', remarks !== undefined ? remarks : null, req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reactivateBooking = async (req, res) => {
    try {
        const result = await db.query(`
            UPDATE bookings 
            SET status = 'confirmed',
                is_checked_in = true,
                check_in_time = COALESCE(check_in_time, CURRENT_TIMESTAMP),
                payment_remark = COALESCE(payment_remark, 'Pending')
            WHERE id = $1 
            RETURNING *
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(result.rows[0]);
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
    const { payment_status, remarks, payment_remark, is_checked_in } = req.body;
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
        if (payment_remark !== undefined) {
            values.push(payment_remark);
            updates.push(`payment_remark = $${values.length}`);
        }
        if (is_checked_in !== undefined) {
            values.push(is_checked_in);
            updates.push(`is_checked_in = $${values.length}`);
            if (is_checked_in) {
                updates.push(`check_in_time = CURRENT_TIMESTAMP`);
            }
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
        const result = await db.query(`
            SELECT u.id, u.name, u.username, u.phone, u.role, u.doctor_id, u.is_active, d.name as doctor_name
            FROM users u
            LEFT JOIN doctors d ON u.doctor_id = d.id
            ORDER BY u.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM doctors WHERE is_active = true ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctorTypes = async (req, res) => {
    try {
        const result = await db.query('SELECT name FROM doctor_types ORDER BY name ASC');
        res.json(result.rows.map(r => r.name));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addDoctorType = async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('INSERT INTO doctor_types (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
        res.json({ success: true, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addStaff = async (req, res) => {
    const { name, username, password, phone, role, doctor_id } = req.body;
    try {
        const query = `
            INSERT INTO users (name, username, password, phone, role, doctor_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, name, username, phone, role, doctor_id, is_active
        `;
        const values = [name, username, password, phone, role || 'staff', role === 'doctor' ? (doctor_id || null) : null];
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
    const { name, type, specialty, sessions } = req.body;
    let client;
    try {
        client = await db.pool.connect();
        await client.query('BEGIN');
        
        const query = `
            INSERT INTO doctors ("name", "type", "specialty") 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const values = [name, type || 'general', specialty];
        const result = await client.query(query, values);
        const doctor = result.rows[0];

        // Ensure type exists in doctor_types
        if (type) {
            await client.query('INSERT INTO doctor_types (name) VALUES ($1) ON CONFLICT DO NOTHING', [type]);
        }

        if (sessions && Array.isArray(sessions)) {
            for (const s of sessions) {
                await client.query(
                    `INSERT INTO sessions (doctor_id, session_type, start_time, end_time, max_tokens, booking_opens_at, booking_closes_before_minutes, day_of_week) 
                     VALUES ($1::uuid, $2::session_type_enum, $3, $4, $5, $6, $7, $8)`,
                    [doctor.id, s.session_type, s.start_time, s.end_time, s.max_tokens, s.booking_opens_at, s.booking_closes_before_minutes, s.day_of_week]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json(doctor);
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Add doctor error:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        if (client) client.release();
    }
};

exports.updateStaff = async (req, res) => {
    const { id } = req.params;
    const { name, phone, role, password, doctor_id } = req.body;
    try {
        let query, values;
        const actualDoctorId = role === 'doctor' ? (doctor_id || null) : null;
        if (password) {
            query = `
                UPDATE users 
                SET name = $1, phone = $2, role = $3, password = $4, doctor_id = $5
                WHERE id = $6 
                RETURNING id, name, username, phone, role, doctor_id, is_active
            `;
            values = [name, phone, role, password, actualDoctorId, id];
        } else {
            query = `
                UPDATE users 
                SET name = $1, phone = $2, role = $3, doctor_id = $4
                WHERE id = $5 
                RETURNING id, name, username, phone, role, doctor_id, is_active
            `;
            values = [name, phone, role, actualDoctorId, id];
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
    const { name, type, specialty, sessions } = req.body;
    let client;
    try {
        client = await db.pool.connect();
        await client.query('BEGIN');
        
        const query = `
            UPDATE doctors 
            SET "name" = $1, "type" = $2, "specialty" = $3
            WHERE id = $4::uuid 
            RETURNING *
        `;
        const values = [name, type, specialty, id];
        const result = await client.query(query, values);
        
        // Ensure type exists in doctor_types
        if (type) {
            await client.query('INSERT INTO doctor_types (name) VALUES ($1) ON CONFLICT DO NOTHING', [type]);
        }

        if (result.rows.length === 0) {
            if (client) await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (sessions && Array.isArray(sessions)) {
            // Get all existing session IDs for this doctor
            const existingRes = await client.query('SELECT id FROM sessions WHERE doctor_id = $1::uuid', [id]);
            const existingIds = existingRes.rows.map(r => r.id);
            const processedIds = [];

            for (const s of sessions) {
                if (s.id && existingIds.includes(s.id)) {
                    await client.query(
                        `UPDATE sessions 
                         SET session_type = $1::session_type_enum, start_time = $2, end_time = $3, max_tokens = $4, 
                             booking_opens_at = $5, booking_closes_before_minutes = $6, day_of_week = $7, is_active = true 
                         WHERE id = $8::uuid`,
                        [s.session_type, s.start_time, s.end_time, s.max_tokens, s.booking_opens_at, s.booking_closes_before_minutes, s.day_of_week, s.id]
                    );
                    processedIds.push(s.id);
                } else {
                    await client.query(
                        `INSERT INTO sessions (doctor_id, session_type, start_time, end_time, max_tokens, booking_opens_at, booking_closes_before_minutes, day_of_week) 
                         VALUES ($1::uuid, $2::session_type_enum, $3, $4, $5, $6, $7, $8)`,
                        [id, s.session_type, s.start_time, s.end_time, s.max_tokens, s.booking_opens_at, s.booking_closes_before_minutes, s.day_of_week]
                    );
                }
            }

            // For sessions that were NOT in the request, safely remove or disable them
            const toRemove = existingIds.filter(eid => !processedIds.includes(eid));
            for (const rid of toRemove) {
                // In Postgres, a failed query in a transaction (like a FK violation) aborts the transaction.
                // We must check if bookings exist BEFORE attempting to delete.
                const bookingCheck = await client.query('SELECT COUNT(*) FROM bookings WHERE session_id = $1::uuid', [rid]);
                if (parseInt(bookingCheck.rows[0].count) === 0) {
                    await client.query('DELETE FROM sessions WHERE id = $1::uuid', [rid]);
                } else {
                    // If bookings exist, we cannot delete the session, so we mark it inactive.
                    await client.query('UPDATE sessions SET is_active = false WHERE id = $1::uuid', [rid]);
                }
            }
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Update doctor error:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        if (client) client.release();
    }
};

exports.toggleDoctorAvailability = async (req, res) => {
    const { id } = req.params;
    const { date, is_available, session_type } = req.body; // is_available = true means PRESENT
    try {
        if (is_available) {
            // Remove from blocked_dates (Make Present)
            if (session_type === 'both') {
                await db.query('DELETE FROM blocked_dates WHERE doctor_id = $1 AND blocked_date = $2', [id, date]);
            } else {
                await db.query('DELETE FROM blocked_dates WHERE doctor_id = $1 AND blocked_date = $2 AND (session_type = $3 OR session_type IS NULL)', [id, date, session_type]);
            }
        } else {
            // Add to blocked_dates (Make Absent)
            if (session_type === 'both') {
                // Delete specific ones first to avoid conflict when adding NULL (full day)
                await db.query('DELETE FROM blocked_dates WHERE doctor_id = $1 AND blocked_date = $2', [id, date]);
                await db.query(
                    'INSERT INTO blocked_dates (doctor_id, blocked_date, session_type, reason) VALUES ($1, $2, $3, $4)',
                    [id, date, null, 'Manual Block (Full Day)']
                );
            } else {
                await db.query(
                    'INSERT INTO blocked_dates (doctor_id, blocked_date, session_type, reason) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                    [id, date, session_type, 'Manual Block']
                );
            }
        }
        res.json({ success: true, is_available, date, session_type });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctorAvailability = async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;
    try {
        const result = await db.query('SELECT session_type FROM blocked_dates WHERE doctor_id = $1 AND blocked_date = $2', [id, date]);
        // If any row has session_type NULL, it's a full day block
        const blocks = result.rows.map(r => r.session_type);
        const is_full_day = blocks.includes(null);
        res.json({ 
            is_full_day,
            blocked_sessions: blocks
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if doctor has bookings
        const bookingRes = await db.query('SELECT COUNT(*) FROM bookings WHERE doctor_id = $1::uuid', [id]);
        if (parseInt(bookingRes.rows[0].count) > 0) {
            // Soft delete
            await db.query('UPDATE doctors SET is_active = false WHERE id = $1::uuid', [id]);
            res.json({ success: true, message: 'Doctor marked as inactive due to existing bookings' });
        } else {
            // Hard delete (will also cascade delete sessions)
            await db.query('DELETE FROM doctors WHERE id = $1::uuid', [id]);
            res.json({ success: true, message: 'Doctor deleted successfully' });
        }
    } catch (err) {
        console.error('Delete doctor error:', err.message);
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

        for (const booking of remainingBookings.rows) {
            const estTime = await tokenService.calculateEstimatedTime(session_id, booking.token_number, booking_date, client);
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

exports.getDashboardStats = async (req, res) => {
    const { doctorId, range = 'week' } = req.query;
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Today's total patients
        let todayPatientsQuery = 'SELECT COUNT(*) FROM bookings WHERE booking_date = $1';
        let todayPatientsParams = [todayStr];
        if (doctorId) {
            todayPatientsQuery += ' AND doctor_id = $2';
            todayPatientsParams.push(doctorId);
        }
        const todayRes = await db.query(todayPatientsQuery, todayPatientsParams);
        const todayPatients = parseInt(todayRes.rows[0].count);

        // Active sessions today
        let sessionQuery = 'SELECT COUNT(*) FROM sessions WHERE id IN (SELECT DISTINCT session_id FROM bookings WHERE booking_date = $1';
        let sessionParams = [todayStr];
        if (doctorId) {
            sessionQuery += ' AND doctor_id = $2';
            sessionParams.push(doctorId);
        }
        sessionQuery += ')';
        const sessionRes = await db.query(sessionQuery, sessionParams);
        const activeSessions = parseInt(sessionRes.rows[0].count);

        // Top Doctor / Performer
        let topDoctor = '—';
        if (doctorId) {
            const docNameRes = await db.query('SELECT name FROM doctors WHERE id = $1', [doctorId]);
            topDoctor = docNameRes.rows[0]?.name || '—';
        } else {
            const topDoctorRes = await db.query(`
                SELECT d.name, COUNT(b.id) as count 
                FROM bookings b 
                JOIN doctors d ON b.doctor_id = d.id 
                GROUP BY d.name 
                ORDER BY count DESC 
                LIMIT 1
            `);
            topDoctor = topDoctorRes.rows[0]?.name || '—';
        }

        // Traffic calculation based on range: 'week' | 'month' | '6months' | 'year'
        let traffic = [];

        if (range === 'month') {
            // Group by 4 weekly buckets in past 28 days
            let monthQuery = `
                SELECT 
                    to_char(booking_date, 'YYYY-MM-DD') as date_str,
                    COUNT(*) as count 
                FROM bookings 
                WHERE booking_date >= CURRENT_DATE - INTERVAL '27 days'
                  AND booking_date <= CURRENT_DATE
            `;
            let monthParams = [];
            if (doctorId) {
                monthQuery += ' AND doctor_id = $1';
                monthParams.push(doctorId);
            }
            monthQuery += ` GROUP BY date_str ORDER BY date_str ASC`;
            const monthRes = await db.query(monthQuery, monthParams);

            const dayCountMap = {};
            monthRes.rows.forEach(r => {
                dayCountMap[r.date_str] = parseInt(r.count);
            });

            // 4 weeks
            for (let i = 3; i >= 0; i--) {
                const endD = new Date();
                endD.setDate(endD.getDate() - (i * 7));
                const startD = new Date();
                startD.setDate(startD.getDate() - (i * 7 + 6));
                
                const startStr = startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endStr = endD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                let weekSum = 0;
                const cur = new Date(startD);
                while (cur <= endD) {
                    const dStr = cur.toISOString().split('T')[0];
                    weekSum += (dayCountMap[dStr] || 0);
                    cur.setDate(cur.getDate() + 1);
                }

                traffic.push({
                    day: `W${4 - i}`,
                    label: `Week ${4 - i}`,
                    subLabel: `${startStr} - ${endStr}`,
                    count: weekSum
                });
            }
        } else if (range === '6months') {
            let halfYearQuery = `
                SELECT 
                    to_char(booking_date, 'YYYY-MM') as month_key,
                    COUNT(*) as count 
                FROM bookings 
                WHERE booking_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
                  AND booking_date <= CURRENT_DATE
            `;
            let halfYearParams = [];
            if (doctorId) {
                halfYearQuery += ' AND doctor_id = $1';
                halfYearParams.push(doctorId);
            }
            halfYearQuery += ` GROUP BY month_key ORDER BY month_key ASC`;
            const halfYearRes = await db.query(halfYearQuery, halfYearParams);

            const monthCountMap = {};
            halfYearRes.rows.forEach(r => {
                monthCountMap[r.month_key] = parseInt(r.count);
            });

            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setDate(1);
                d.setMonth(d.getMonth() - i);
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                traffic.push({
                    day: monthName,
                    label: monthName,
                    subLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    count: monthCountMap[monthKey] || 0
                });
            }
        } else if (range === 'year') {
            let yearQuery = `
                SELECT 
                    to_char(booking_date, 'YYYY-MM') as month_key,
                    COUNT(*) as count 
                FROM bookings 
                WHERE booking_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
                  AND booking_date <= CURRENT_DATE
            `;
            let yearParams = [];
            if (doctorId) {
                yearQuery += ' AND doctor_id = $1';
                yearParams.push(doctorId);
            }
            yearQuery += ` GROUP BY month_key ORDER BY month_key ASC`;
            const yearRes = await db.query(yearQuery, yearParams);

            const monthCountMap = {};
            yearRes.rows.forEach(r => {
                monthCountMap[r.month_key] = parseInt(r.count);
            });

            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setDate(1);
                d.setMonth(d.getMonth() - i);
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                traffic.push({
                    day: monthName,
                    label: monthName,
                    subLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    count: monthCountMap[monthKey] || 0
                });
            }
        } else {
            // Default: 'week' (7 days)
            let weeklyQuery = `
                SELECT 
                    to_char(booking_date, 'YYYY-MM-DD') as date_str,
                    COUNT(*) as count 
                FROM bookings 
                WHERE booking_date >= CURRENT_DATE - INTERVAL '6 days'
                  AND booking_date <= CURRENT_DATE
            `;
            let weeklyParams = [];
            if (doctorId) {
                weeklyQuery += ' AND doctor_id = $1';
                weeklyParams.push(doctorId);
            }
            weeklyQuery += ` GROUP BY date_str ORDER BY date_str ASC`;
            const weeklyRes = await db.query(weeklyQuery, weeklyParams);
            
            const trafficMap = {};
            weeklyRes.rows.forEach(r => {
                trafficMap[r.date_str] = parseInt(r.count);
            });

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const fullDateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                traffic.push({
                    day: dayName,
                    label: dayName,
                    subLabel: fullDateStr,
                    count: trafficMap[dateStr] || 0
                });
            }
        }

        res.json({
            todayPatients,
            activeSessions,
            topDoctor,
            range,
            traffic,
            weeklyTraffic: traffic,
            // Estimated revenue (mock logic: number of patients * average fee)
            monthRevenue: `₹${(todayPatients * 350).toLocaleString()}` 
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getActiveStaff = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, name, username, role, last_active_at 
            FROM users 
            WHERE last_active_at >= NOW() - INTERVAL '10 minutes'
            ORDER BY last_active_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching active staff:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAttendance = async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    try {
        const query = `
            SELECT u.id as staff_id, u.name, u.username, u.role, u.phone, sa.status 
            FROM users u
            LEFT JOIN staff_attendance sa ON u.id = sa.staff_id AND sa.date = $1
            WHERE u.is_active = true AND u.role IN ('staff', 'receptionist', 'admin')
            ORDER BY u.name ASC
        `;
        const result = await db.query(query, [date]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.markAttendance = async (req, res) => {
    const { staffId, date, status } = req.body;
    if (!staffId || !date || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['present', 'absent', 'half_morning', 'half_evening'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    try {
        const query = `
            INSERT INTO staff_attendance (staff_id, date, status)
            VALUES ($1, $2, $3)
            ON CONFLICT (staff_id, date)
            DO UPDATE SET status = EXCLUDED.status, created_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await db.query(query, [staffId, date, status]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error marking attendance:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAttendanceReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start and end dates are required' });
    try {
        const query = `
            SELECT u.name, u.username, u.role, 
                   SUM(CASE 
                     WHEN sa.status = 'present' THEN 1 
                     WHEN sa.status IN ('half_morning', 'half_evening') THEN 0.5 
                     ELSE 0 END) as present_days,
                   SUM(CASE 
                     WHEN sa.status = 'absent' THEN 1 
                     WHEN sa.status IN ('half_morning', 'half_evening') THEN 0.5 
                     ELSE 0 END) as absent_days
            FROM users u
            LEFT JOIN staff_attendance sa ON u.id = sa.staff_id AND sa.date >= $1 AND sa.date <= $2
            WHERE u.is_active = true AND u.role IN ('staff', 'receptionist', 'admin')
            GROUP BY u.id, u.name, u.username, u.role, u.phone
            ORDER BY u.name ASC
        `;
        const result = await db.query(query, [startDate, endDate]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching attendance report:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.submitBulkAttendance = async (req, res) => {
    const { date, attendance } = req.body;
    if (!date || !attendance || !Array.isArray(attendance)) {
        return res.status(400).json({ error: 'Missing required fields or invalid format' });
    }
    
    let client;
    try {
        client = await db.pool.connect();
        await client.query('BEGIN');
        
        for (const item of attendance) {
            if (item.status && ['present', 'absent', 'half_morning', 'half_evening'].includes(item.status)) {
                const query = `
                    INSERT INTO staff_attendance (staff_id, date, status)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (staff_id, date)
                    DO UPDATE SET status = EXCLUDED.status, created_at = CURRENT_TIMESTAMP
                `;
                await client.query(query, [item.staff_id, date, item.status]);
            }
        }
        
        await client.query('COMMIT');
        res.json({ success: true, message: 'Attendance submitted successfully' });
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error submitting bulk attendance:', err);
        res.status(500).json({ error: err.message });
    } finally {
        if (client) client.release();
    }
};

exports.updateSystemSettings = async (req, res) => {
    const { booking_restriction } = req.body;
    if (!booking_restriction || !['none', 'guest', 'all'].includes(booking_restriction)) {
        return res.status(400).json({ error: 'Invalid booking restriction setting' });
    }
    try {
        const query = `
            INSERT INTO system_settings (key, value, updated_at)
            VALUES ('booking_restriction', $1, CURRENT_TIMESTAMP)
            ON CONFLICT (key)
            DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await db.query(query, [booking_restriction]);
        res.json({ success: true, booking_restriction: result.rows[0].value });
    } catch (err) {
        console.error('Error updating system settings:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateSessionRestriction = async (req, res) => {
    const { sessionId } = req.params;
    const { date, booking_restriction } = req.body;
    if (!sessionId || !date || !booking_restriction || !['none', 'guest', 'all'].includes(booking_restriction)) {
        return res.status(400).json({ error: 'sessionId, date, and valid booking_restriction are required' });
    }
    try {
        const query = `
            INSERT INTO session_restrictions (session_id, restriction_date, restriction_type, created_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (session_id, restriction_date)
            DO UPDATE SET restriction_type = EXCLUDED.restriction_type, created_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await db.query(query, [sessionId, date, booking_restriction]);
        res.json({ success: true, booking_restriction: result.rows[0].restriction_type });
    } catch (err) {
        console.error('Error updating session settings:', err);
        res.status(500).json({ error: err.message });
    }
};
