const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const test = require('node:test');
const assert = require('node:assert');
const { calculateEstimatedTime, timeToMinutes, minutesToTime, getISTDateTime } = require('../services/tokenService');

// In-memory mock database client for deterministic unit testing
function createMockDb(sessionStartTime, initialBookings = []) {
    const bookings = [...initialBookings];
    return {
        query: async (sql, params) => {
            if (sql.includes('FROM sessions WHERE id = $1')) {
                return { rows: [{ start_time: sessionStartTime }] };
            }
            if (sql.includes('token_number < $3') || sql.includes('SELECT token_number')) {
                const [sessionId, bookingDate, maxToken] = params;
                const matches = bookings
                    .filter(b => b.session_id === sessionId && b.booking_date === bookingDate && b.token_number < maxToken)
                    .sort((a, b) => b.token_number - a.token_number);
                return { rows: matches.length > 0 ? [matches[0]] : [] };
            }
            return { rows: [] };
        },
        addBooking: (session_id, booking_date, token_number, estimated_time) => {
            bookings.push({ session_id, booking_date, token_number, estimated_time });
        }
    };
}

test('1. Normal queue calculation before session start', async () => {
    // Session starts at 09:00:00, current time is 08:30:00 (510 mins) on 2026-09-04
    const mockNow = new Date('2026-09-04T08:30:00+05:30');
    const mockDb = createMockDb('09:00:00');

    // Token #1 -> should be 09:00:00
    const eta1 = await calculateEstimatedTime('sess-1', 1, '2026-09-04', mockDb, mockNow);
    assert.strictEqual(eta1, '09:00:00');
    mockDb.addBooking('sess-1', '2026-09-04', 1, eta1);

    // Token #2 -> should be 09:01:00
    const eta2 = await calculateEstimatedTime('sess-1', 2, '2026-09-04', mockDb, mockNow);
    assert.strictEqual(eta2, '09:01:00');
    mockDb.addBooking('sess-1', '2026-09-04', 2, eta2);

    // Token #3 -> should be 09:02:00
    const eta3 = await calculateEstimatedTime('sess-1', 3, '2026-09-04', mockDb, mockNow);
    assert.strictEqual(eta3, '09:02:00');
});

test('2. Late booking scenario: Queue ETA is in the past, catches up to Current Time + 1 min', async () => {
    // Session start: 09:00:00
    // Current time: 11:30:00 (690 mins) on 2026-09-04
    // Calculated queue ETA for Token 72 would be 09:00 + 71 mins = 10:11:00
    const mockNow = new Date('2026-09-04T11:30:00+05:30');
    
    // Existing 71 bookings generated earlier in the morning
    const existing = [];
    for (let i = 1; i <= 71; i++) {
        const estMins = 9 * 60 + (i - 1);
        existing.push({
            session_id: 'sess-1',
            booking_date: '2026-09-04',
            token_number: i,
            estimated_time: minutesToTime(estMins)
        });
    }
    const mockDb = createMockDb('09:00:00', existing);

    // Token 72 booked at 11:30:00 -> should catch up to 11:31:00
    const eta72 = await calculateEstimatedTime('sess-1', 72, '2026-09-04', mockDb, mockNow);
    assert.strictEqual(eta72, '11:31:00');
    mockDb.addBooking('sess-1', '2026-09-04', 72, eta72);

    // Subsequent Token 73 booked immediately after -> should be 11:32:00
    const eta73 = await calculateEstimatedTime('sess-1', 73, '2026-09-04', mockDb, mockNow);
    assert.strictEqual(eta73, '11:32:00');
    mockDb.addBooking('sess-1', '2026-09-04', 73, eta73);

    // Subsequent Token 74 booked immediately after -> should be 11:33:00
    const eta74 = await calculateEstimatedTime('sess-1', 74, '2026-09-04', mockDb, mockNow);
    assert.strictEqual(eta74, '11:33:00');
});

test('3. Gap between late bookings: Catches up again if queue falls behind', async () => {
    // Previous booking (Token 74) had ETA 11:33:00
    const existing = [
        { session_id: 'sess-1', booking_date: '2026-09-04', token_number: 74, estimated_time: '11:33:00' }
    ];
    const mockDb = createMockDb('09:00:00', existing);

    // 45 minutes later at 12:15:00, Token 75 is booked
    const mockNow1215 = new Date('2026-09-04T12:15:00+05:30');
    const eta75 = await calculateEstimatedTime('sess-1', 75, '2026-09-04', mockDb, mockNow1215);
    assert.strictEqual(eta75, '12:16:00');
    mockDb.addBooking('sess-1', '2026-09-04', 75, eta75);

    // Token 76 booked right after at 12:15:00 -> should be 12:17:00
    const eta76 = await calculateEstimatedTime('sess-1', 76, '2026-09-04', mockDb, mockNow1215);
    assert.strictEqual(eta76, '12:17:00');
});

test('4. Future date booking: Always calculatesfrom session start time', async () => {
    // Current time is 11:30:00 today (2026-09-04)
    const mockNow = new Date('2026-09-04T11:30:00+05:30');
    const mockDb = createMockDb('09:00:00');

    // Booking for tomorrow (2026-09-05) -> Token 1 gets 09:00:00 (NOT 11:31:00)
    const etaTomorrow1 = await calculateEstimatedTime('sess-1', 1, '2026-09-05', mockDb, mockNow);
    assert.strictEqual(etaTomorrow1, '09:00:00');
    mockDb.addBooking('sess-1', '2026-09-05', 1, etaTomorrow1);

    const etaTomorrow2 = await calculateEstimatedTime('sess-1', 2, '2026-09-05', mockDb, mockNow);
    assert.strictEqual(etaTomorrow2, '09:01:00');
});

test('5. First patient booking after session start time on current day', async () => {
    // Session start 09:00:00, but first patient books at 09:45:00
    const mockNow = new Date('2026-09-04T09:45:00+05:30');
    const mockDb = createMockDb('09:00:00');

    const eta1 = await calculateEstimatedTime('sess-1', 1, '2026-09-04', mockDb, mockNow);
    assert.strictEqual(eta1, '09:46:00');
});
