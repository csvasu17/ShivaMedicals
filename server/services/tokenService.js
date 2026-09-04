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
    if (!timeStr) return 0;
    const parts = String(timeStr).split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
}

// Helper to convert minutes to HH:MM:SS
function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
}

// Helper to get current date and time in IST (Asia/Kolkata)
function getISTDateTime(customDate = null) {
    const now = customDate ? (customDate instanceof Date ? customDate : new Date(customDate)) : new Date();
    const istFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const parts = istFormatter.formatToParts(now);
    const getPart = (type) => parts.find(p => p.type === type)?.value;
    const dateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    const hours = parseInt(getPart('hour'), 10) || 0;
    const minutes = parseInt(getPart('minute'), 10) || 0;
    const seconds = parseInt(getPart('second'), 10) || 0;
    const currentMins = hours * 60 + minutes;

    return {
        dateStr,
        hours,
        minutes,
        seconds,
        currentMins
    };
}

async function calculateEstimatedTime(sessionId, tokenNumber, bookingDateStr = null, client = db, mockNow = null) {
    const result = await client.query('SELECT start_time FROM sessions WHERE id = $1', [sessionId]);
    if (result.rows.length === 0) throw new Error('Session not found');
    const { start_time } = result.rows[0];
    
    const startMins = timeToMinutes(start_time);
    const normalQueueMins = startMins + (tokenNumber - 1);
    let calculatedEtaMins = normalQueueMins;

    const formattedDateStr = typeof bookingDateStr === 'string' 
        ? bookingDateStr.split('T')[0] 
        : (bookingDateStr instanceof Date ? bookingDateStr.toISOString().split('T')[0] : null);

    // Look up previous bookings in this session on this date to continue ETA sequentially
    if (formattedDateStr) {
        const prevRes = await client.query(
            `SELECT token_number, estimated_time 
             FROM bookings 
             WHERE session_id = $1 AND booking_date = $2 AND token_number < $3 
             ORDER BY token_number DESC LIMIT 1`,
            [sessionId, formattedDateStr, tokenNumber]
        );

        if (prevRes.rows.length > 0 && prevRes.rows[0].estimated_time) {
            const prevEtaMins = timeToMinutes(prevRes.rows[0].estimated_time);
            const tokensDiff = tokenNumber - prevRes.rows[0].token_number;
            const continuedEtaMins = prevEtaMins + tokensDiff;
            calculatedEtaMins = Math.max(normalQueueMins, continuedEtaMins);
        }
    }

    // Compare with current time if the booking is for today (in IST)
    const ist = getISTDateTime(mockNow);
    const isToday = formattedDateStr ? (formattedDateStr === ist.dateStr) : false;

    if (isToday) {
        if (calculatedEtaMins <= ist.currentMins) {
            calculatedEtaMins = ist.currentMins + 1;
        }
    }

    return minutesToTime(calculatedEtaMins);
}

async function isBookingOpen(sessionId, bookingDateStr) {
    const result = await db.query(`
        SELECT s.start_time, s.end_time, s.booking_closes_before_minutes, s.doctor_id, s.session_type
        FROM sessions s 
        WHERE s.id = $1
    `, [sessionId]);
    if (result.rows.length === 0) return false;

    const { doctor_id, start_time, end_time, booking_closes_before_minutes, session_type } = result.rows[0];
    
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
    
    const sessionEndTime = new Date(by, bm - 1, bd);
    const [eh, em, es] = end_time.split(':').map(Number);
    sessionEndTime.setHours(eh, em, es || 0, 0);
    
    // Check if it's too early (more than 24h before)
    const opensAtDate = new Date(sessionStartTime);
    opensAtDate.setHours(opensAtDate.getHours() - 36); // Open 36h before

    if (today < opensAtDate) return false;

    // Check if it's too late (session ended)
    // We allow booking until the session ends for better flexibility
    if (today > sessionEndTime) return false;

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
    getAvailableSlots,
    timeToMinutes,
    minutesToTime,
    getISTDateTime
};
