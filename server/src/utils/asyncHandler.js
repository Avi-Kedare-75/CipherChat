/**
 * Wraps an async route handler to catch errors and forward them to Express error middleware.
 * Eliminates the need for try-catch blocks in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
