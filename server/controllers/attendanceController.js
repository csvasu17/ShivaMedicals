const db = require('../db');

const attendanceController = {
    getAttendanceByDate: async (req, res) => {
        const { date } = req.query;
        try {
            // Get all staff members (role != superadmin? or just all users)
            const staffRes = await db.query('SELECT id, name, username, role FROM users WHERE is_active = true ORDER BY name ASC');
            const staffs = staffRes.rows;

            // Get attendance for the specific date
            const attendanceRes = await db.query(
                'SELECT * FROM attendance WHERE date = $1',
                [date || new Date().toISOString().split('T')[0]]
            );
            const attendanceRecords = attendanceRes.rows;

            // Merge attendance data into staff list
            const result = staffs.map(staff => {
                const record = attendanceRecords.find(r => r.user_id === staff.id);
                return {
                    ...staff,
                    attendance: record || { status: 'none', check_in: null, check_out: null, notes: '' }
                };
            });

            res.json(result);
        } catch (err) {
            console.error('Failed to get attendance:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    markAttendance: async (req, res) => {
        const { userId, date, status, checkIn, checkOut, notes } = req.body;
        try {
            const query = `
                INSERT INTO attendance (user_id, date, status, check_in, check_out, notes)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, date)
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    check_in = EXCLUDED.check_in,
                    check_out = EXCLUDED.check_out,
                    notes = EXCLUDED.notes
                RETURNING *
            `;
            const values = [userId, date, status, checkIn, checkOut, notes];
            const result = await db.query(query, values);
            res.json(result.rows[0]);
        } catch (err) {
            console.error('Failed to mark attendance:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = attendanceController;
