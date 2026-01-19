// Validation middleware for request body

const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];

            // Required check
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({ field, message: `${field} is required` });
                continue;
            }

            // Skip further validation if not required and empty
            if (!value && !rules.required) continue;

            // Type check
            if (rules.type) {
                const actualType = typeof value;
                if (rules.type === 'number' && isNaN(Number(value))) {
                    errors.push({ field, message: `${field} must be a number` });
                } else if (rules.type === 'string' && actualType !== 'string') {
                    errors.push({ field, message: `${field} must be a string` });
                } else if (rules.type === 'boolean' && actualType !== 'boolean') {
                    errors.push({ field, message: `${field} must be a boolean` });
                } else if (rules.type === 'array' && !Array.isArray(value)) {
                    errors.push({ field, message: `${field} must be an array` });
                }
            }

            // Min length
            if (rules.minLength && value.length < rules.minLength) {
                errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
            }

            // Max length
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
            }

            // Email format
            if (rules.email && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.push({ field, message: `${field} must be a valid email` });
                }
            }

            // Phone format (Indian)
            if (rules.phone && value) {
                const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
                if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                    errors.push({ field, message: `${field} must be a valid Indian phone number` });
                }
            }

            // Enum check
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
            }

            // Min value
            if (rules.min !== undefined && Number(value) < rules.min) {
                errors.push({ field, message: `${field} must be at least ${rules.min}` });
            }

            // Max value
            if (rules.max !== undefined && Number(value) > rules.max) {
                errors.push({ field, message: `${field} must be at most ${rules.max}` });
            }

            // Date check
            if (rules.date && value) {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    errors.push({ field, message: `${field} must be a valid date` });
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }

        next();
    };
};

module.exports = { validate };
