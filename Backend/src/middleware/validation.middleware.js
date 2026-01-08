const { ValidationError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return next(new ValidationError(error.details[0].message));
    }
    next();
};

module.exports = validate;
