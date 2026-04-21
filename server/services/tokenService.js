const db = require('../db');

async function getNextTokenNumber(sessionId, date) {
    const result = await db.query(
        'SELECT MAX(token_number) as max_token FROM bookings WHERE session_id = $1 AND booking_date = $2',
        [sessionId, date]
    );
    const maxToken = result.rows[0].max_token || 0;
    return maxToken + 1;
}

// Helper to convert HH:MM:SS to minutes since midnight
function timeToMinutes(timeStr) {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// Helper to convert minutes to HH:MM:SS
function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}:00`;
}

async function calculateEstimatedTime(sessionId, tokenNumber) {
    const result = await db.query('SELECT start_time FROM sessions WHERE id = $1', [sessionId]);
    if (result.rows.length === 0) throw new Error('Session not found');
    const { start_time } = result.rows[0];
    
    const startMins = timeToMinutes(start_time);
    
    // One appointment per minute
    const estMins = startMins + (tokenNumber - 1); 
    
    return minutesToTime(estMins);
}

async function isBookingOpen(sessionId, bookingDateStr) {
    const result = await db.query(`
        SELECT s.start_time, s.booking_closes_before_minutes, s.doctor_id, s.session_type
        FROM sessions s 
        WHERE s.id = $1
    `, [sessionId]);
    if (result.rows.length === 0) return false;

    const { doctor_id, start_time, booking_closes_before_minutes, session_type } = result.rows[0];
    
    // Check if the doctor has blocked this specific date/session
    const blockedRes = await db.query(
        `SELECT 1 FROM blocked_dates 
         WHERE doctor_id = $1 AND blocked_date = $2 
         AND (session_type = $3 OR session_type IS NULL)`,
        [doctor_id, bookingDateStr, session_type]
    );

    if (blockedRes.rows.length > 0) return false;
    
    const today = new Date();
    const [by, bm, bd] = bookingDateStr.split('-').map(Number);
    const sessionStartTime = new Date(by, bm - 1, bd); 
    const [sh, sm, ss] = start_time.split(':').map(Number);
    sessionStartTime.setHours(sh, sm, ss || 0, 0);
    
    const opensAtDate = new Date(sessionStartTime);
    opensAtDate.setHours(opensAtDate.getHours() - 24);

    if (today < opensAtDate) return false;

    const closesAtDate = new Date(sessionStartTime);
    closesAtDate.setMinutes(closesAtDate.getMinutes() - booking_closes_before_minutes);

    if (today > closesAtDate) return false;

    return true;
}

async function getAvailableSlots(sessionId, date) {
    const sessionRes = await db.query('SELECT max_tokens FROM sessions WHERE id = $1', [sessionId]);
    if (sessionRes.rows.length === 0) return 0;
    
    const maxTokens = sessionRes.rows[0].max_tokens;
    
    const bookedRes = await db.query(
        "SELECT COUNT(*) as count FROM bookings WHERE session_id = $1 AND booking_date = $2 AND status != 'cancelled'",
        [sessionId, date]
    );
    const bookedCount = parseInt(bookedRes.rows[0].count, 10);
    
    return Math.max(0, maxTokens - bookedCount);
}

module.exports = {
    getNextTokenNumber,
    calculateEstimatedTime,
    isBookingOpen,
    getAvailableSlots
};
