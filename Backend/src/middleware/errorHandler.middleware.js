const { nodeEnv } = require('../config/env');
const response = require('../utils/response');

module.exports = (err, req, res, next) => {
    if (nodeEnv !== 'production') {
        console.error(err.stack);
    }

    const status = err.statusCode || 500;
    const message = (nodeEnv === 'production' && status === 500)
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error';

    return response.error(res, message, status, nodeEnv !== 'production' ? { stack: err.stack } : null);
};
