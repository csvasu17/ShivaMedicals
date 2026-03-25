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
