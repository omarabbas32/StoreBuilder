const { port } = require('./config/env');
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

// Request ID Middleware
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
});

// Middleware
app.use(helmet());
app.use(cors());
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
