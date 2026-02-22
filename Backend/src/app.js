const { port, nodeEnv } = require('./config/env');
console.log('[DEBUG_APP] Starting app.js');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const routes = require('./routes/index');
const { errorHandler } = require('./middleware/errorHandler');
const tenantMiddleware = require('./middleware/tenant');

const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();

console.log(`[DEBUG] Environment: ${nodeEnv}`);

// Request ID Middleware
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
});

const isDevelopment = nodeEnv === 'development';

// Middleware
app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use(cors({
    origin: true, // Allow all origins in dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Multi-tenancy Isolation
app.use(tenantMiddleware);

// Serve uploaded assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Error Handling
app.use(errorHandler);

module.exports = app;
