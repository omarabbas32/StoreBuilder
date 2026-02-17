const { verifyToken } = require('../utils/auth.utils');

/**
 * optionalAuth middleware
 * If a valid token is provided, populate req.user.
 * If no token or invalid token, proceed without req.user.
 * This is useful for routes that support both guest and authenticated flows (like Checkout).
 */
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        // Log error but proceed as guest
        console.log('[optionalAuth] Invalid token, proceeding as guest');
        next();
    }
};
