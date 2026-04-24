const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 6001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
});

