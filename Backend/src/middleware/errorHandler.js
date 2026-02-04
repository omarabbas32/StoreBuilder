const { AppError } = require('../utils/errors');

/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Prisma errors
    if (err.code === 'P2002') {
        statusCode = 409;
        message = 'A record with this value already exists';
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
    } else if (err.code?.startsWith('P')) {
        statusCode = 400;
        message = 'Database operation failed';
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Details:', {
            code: err.code,
            message: err.message,
            meta: err.meta,
            stack: err.stack
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            prismaCode: err.code,
            prismaMeta: err.meta,
            stack: err.stack
        })
    });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
