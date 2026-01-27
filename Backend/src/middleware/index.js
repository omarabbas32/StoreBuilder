const auth = require('./auth');
const { errorHandler, asyncHandler, notFoundHandler } = require('./errorHandler');
const validate = require('./validate');
const role = require('./role');
const tenant = require('./tenant');
const pagination = require('./pagination');

module.exports = {
    auth,
    errorHandler,
    asyncHandler,
    notFoundHandler,
    validate,
    role,
    tenant,
    pagination
};
