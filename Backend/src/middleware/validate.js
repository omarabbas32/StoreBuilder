/**
 * Generic Validation Middleware
 * Validates request data against Zod schema
 * 
 * Usage:
 *   router.post('/cart/add', validate(addItemSchema), controller.addItem);
 */

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            // Determine which part of request to validate
            let dataToValidate;
            switch (source) {
                case 'body':
                    dataToValidate = req.body;
                    break;
                case 'query':
                    dataToValidate = req.query;
                    break;
                case 'params':
                    dataToValidate = req.params;
                    break;
                default:
                    dataToValidate = req.body;
            }

            // Parse and validate
            const result = schema.safeParse(dataToValidate);

            if (!result.success) {
                // Format Zod errors
                const errors = result.error.flatten().fieldErrors;
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
            }

            // Attach validated data to request
            req.validatedData = result.data;
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }
    };
};

module.exports = validate;
