import ApiError from '../utils/ApiError.js';

/**
 * Middleware factory that validates request body/query against a Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Where to pull data from
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
    }

    // Replace with parsed (and potentially transformed) data
    req[source] = result.data;
    next();
  };
};

export default validate;
