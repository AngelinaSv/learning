import { ERROR_MESSAGES, ERROR_CODES } from '../constants/errors/common.errors.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    message: err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    code: err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
  });
};
