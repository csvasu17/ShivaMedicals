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
    const result = await db.query('SELECT start_time, end_time, max_tokens FROM sessions WHERE id = $1', [sessionId]);
    if (result.rows.length === 0) throw new Error('Session not found');
    const { start_time, end_time, max_tokens } = result.rows[0];
    
    const startMins = timeToMinutes(start_time);
    const endMins = timeToMinutes(end_time);
    const totalDurationMins = endMins - startMins;
    const avgMinutesPerPatient = Math.max(1, Math.floor(totalDurationMins / max_tokens));

    const estMins = startMins + ((tokenNumber - 1) * avgMinutesPerPatient);
    return minutesToTime(estMins);
}

async function isBookingOpen(sessionId, bookingDateStr) {
    const result = await db.query('SELECT booking_opens_at, booking_closes_before_minutes, start_time FROM sessions WHERE id = $1', [sessionId]);
    if (result.rows.length === 0) return false;
    
    const { booking_opens_at, booking_closes_before_minutes, start_time } = result.rows[0];
    
    // bookingDateStr is YYYY-MM-DD
    const today = new Date();
    const bookingDate = new Date(bookingDateStr);
    
    // Check if booking is in the past
    if (bookingDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;

    // Check opening time (usually previous night)
    const opensAtDate = new Date(bookingDate);
    opensAtDate.setDate(opensAtDate.getDate() - 1);
    const [oh, om, os] = booking_opens_at.split(':').map(Number);
    opensAtDate.setHours(oh, om, os || 0, 0);

    if (today < opensAtDate) return false;

    // Check closing time
    const closesAtDate = new Date(bookingDate);
    const [sh, sm, ss] = start_time.split(':').map(Number);
    closesAtDate.setHours(sh, sm, ss || 0, 0);
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
