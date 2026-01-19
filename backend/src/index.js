require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const initScheduler = require('./utils/scheduler');

const app = express();

// Initialize Scheduler
initScheduler();

// Middleware
app.use(cors({
    origin: true, // Allow all origins for now
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏋️ Nazen Gym Management API',
        version: '1.0.0',
        gym: 'Nazen – Powered by Being Strong',
        location: 'Handwara, Jammu and Kashmir',
        endpoints: {
            health: '/api/health',
            docs: '/api-docs',
        },
    });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏋️  NAZEN GYM MANAGEMENT SYSTEM                           ║
║   Powered by Being Strong                                    ║
║                                                              ║
║   Server running on http://localhost:${PORT}                    ║
║   Environment: ${config.nodeEnv}                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
