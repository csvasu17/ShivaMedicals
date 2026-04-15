const http = require('http');

const API_URL = 'http://localhost:6001';

function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

async function verifyIntervals() {
    console.log('--- Verifying 1-Minute Intervals ---');

    try {
        const doctorId = 'd1bf98b4-0c2d-4d7a-b153-f72671fc82d5';
        const sessionId = 'e13b23f7-bdb6-4e5d-8922-c7eb1cb68af8';
        const date = new Date().toISOString().split('T')[0];

        const baseBooking = {
            patientName: 'Verif Patient',
            phone: '123' + Math.floor(Math.random() * 10000000),
            patientAgeYears: 25,
            patientAgeMonths: 5,
            location: 'Whitefield',
            doctorId: doctorId,
            sessionId: sessionId,
            date: date
        };

        console.log('Booking Token 1...');
        const res1 = await request(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { ...baseBooking, patientName: 'P1' }
        });
        
        if (res1.status !== 201) {
            console.error('Booking 1 failed:', res1.data);
            return;
        }
        console.log('Token 1:', res1.data.token_number, 'Time:', res1.data.estimated_time);

        console.log('Booking Token 2...');
        const res2 = await request(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { ...baseBooking, patientName: 'P2', phone: '321' + Math.floor(Math.random() * 10000000) }
        });

        if (res2.status !== 201) {
            console.error('Booking 2 failed:', res2.data);
            return;
        }
        console.log('Token 2:', res2.data.token_number, 'Time:', res2.data.estimated_time);

        const t1Str = res1.data.estimated_time;
        const t2Str = res2.data.estimated_time;

        const [h1, m1] = t1Str.split(':').map(Number);
        const [h2, m2] = t2Str.split(':').map(Number);
        
        const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        const tokenDiff = res2.data.token_number - res1.data.token_number;

        console.log('Time Diff (mins):', diff);
        console.log('Token Diff:', tokenDiff);

        if (diff === tokenDiff) {
            console.log('SUCCESS: Each token incremented the time by 1 minute.');
        } else {
            console.log('FAILURE: Time increment does not match token increment.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

verifyIntervals();
