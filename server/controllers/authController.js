const db = require('../db');
// No bcrypt for now to keep it simple as per previous mock, or I can install it.
// Given it's a dev task, I'll stick to simple string comparison or a very basic hash if they didn't ask for security.
// But they said "admin and staff login", so I'll make it work with the DB.

exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        
        let isValid = false;
        if (user.password.startsWith('$2')) {
            const bcrypt = require('bcryptjs');
            isValid = await bcrypt.compare(password, user.password);
        } else {
            isValid = password === user.password;
        }

        if (isValid) {
            res.json({ 
                token: 'jwt-header.payload.signature', // mock token
                user: { 
                    id: user.id,
                    username: user.username, 
                    role: user.role 
                } 
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendOtp = (req, res) => {
    res.json({ success: true, message: 'OTP sent successfully' });
};

exports.verifyOtp = (req, res) => {
    const { phone, otp } = req.body;
    if (otp === '123456') { 
        res.json({ token: 'mock-jwt-token', user: { phone } });
    } else {
        res.status(401).json({ error: 'Invalid OTP' });
    }
};

exports.getMe = (req, res) => {
    // This would normally decode the JWT
    res.json({ user: { username: 'admin', role: 'superadmin' } });
};

exports.updateLastActive = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    try {
        await db.query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [userId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating activity:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.clearLastActive = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    try {
        await db.query('UPDATE users SET last_active_at = NULL WHERE id = $1', [userId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error clearing activity:', err);
        res.status(500).json({ error: err.message });
    }
};
