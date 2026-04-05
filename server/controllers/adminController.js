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

