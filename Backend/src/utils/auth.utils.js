const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret } = require('../config/env');

const JWT_EXPIRES_IN = '7d';

/**
 * Generate a JWT for a user
 */
const generateToken = (payload) => {
    return jwt.sign(payload, jwtSecret || 'your-secret-key', {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Verify a JWT
 */
const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret || 'your-secret-key');
};

/**
 * Generate a random securely-generated string (for verification, resets, etc.)
 */
const generateRandomToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

module.exports = {
    generateToken,
    verifyToken,
    generateRandomToken
};
