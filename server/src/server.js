require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const propertyRoutes = require('./routes/propertyRoutes');
const leadRoutes = require('./routes/leadRoutes');
const searchRoutes = require('./routes/searchRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files - serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'BASALT API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'BASALT Real Estate API',
        version: '1.0.0',
        description: 'Monolithic Precision in Real Estate',
        endpoints: {
            properties: '/api/v1/properties',
            leads: '/api/v1/leads',
            search: '/api/v1/search',
            upload: '/api/v1/upload',
            health: '/api/v1/health'
        }
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║    ██████╗  █████╗ ███████╗ █████╗ ██╗  ████████╗    ║
    ║    ██╔══██╗██╔══██╗██╔════╝██╔══██╗██║  ╚══██╔══╝    ║
    ║    ██████╔╝███████║███████╗███████║██║     ██║       ║
    ║    ██╔══██╗██╔══██║╚════██║██╔══██║██║     ██║       ║
    ║    ██████╔╝██║  ██║███████║██║  ██║███████╗██║       ║
    ║    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝       ║
    ║                                                       ║
    ║    Monolithic Precision in Real Estate                ║
    ║                                                       ║
    ╠═══════════════════════════════════════════════════════╣
    ║    Server running on port: ${PORT}                      ║
    ║    Environment: ${process.env.NODE_ENV || 'development'}                       ║
    ╚═══════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = app;
