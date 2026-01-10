/**
 * Standardized API Response Helper
 */
const sendResponse = (res, statusCode, success, data = null, message = null) => {
    return res.status(statusCode).json({
        success,
        data,
        message,
        timestamp: new Date().toISOString()
    });
};

const success = (res, data, message = 'Success', statusCode = 200) => {
    return sendResponse(res, statusCode, true, data, message);
};

const error = (res, message = 'Error', statusCode = 500, data = null) => {
    return sendResponse(res, statusCode, false, data, message);
};

module.exports = {
    success,
    error
};
