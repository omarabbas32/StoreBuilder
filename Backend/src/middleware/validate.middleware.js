const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false, // show all errors
            allowUnknown: true, // allow fields we might have missed but don't want to block
            stripUnknown: true // but strip them from the final object
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            console.error(`Validation Error (${property}):`, errorMessage);
            console.error('Payload:', req[property]);
            return res.status(400).json({ error: errorMessage });
        }

        // Replace req[property] with the validated and stripped value
        req[property] = schema.validate(req[property], { stripUnknown: true }).value;
        next();
    };
};

module.exports = validate;
