const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});


const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const fetch = require('node-fetch');

const app = express();

// Configure CORS
app.use(cors({
    origin: [
        'https://shiva-medicals.vercel.app',
        'http://localhost:5173',
        'http://localhost:6002'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TTS proxy – avoids CORS on Tizen TV, mobile, and desktop browsers
app.get('/api/tts', async (req, res) => {
    const { text, lang = 'ta' } = req.query;
    if (!text) return res.status(400).json({ error: 'text required' });
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(text)}`;
    try {
        const upstream = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!upstream.ok) return res.status(502).json({ error: 'TTS upstream error' });
        res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        upstream.body.pipe(res);
    } catch (err) {
        console.error('TTS proxy error:', err);
        res.status(502).json({ error: 'TTS proxy failed' });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 6001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
});

