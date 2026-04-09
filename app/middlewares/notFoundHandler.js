import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors/common.errors.js';

export const notFoundHandler = (req, res) => {
     res.status(404).json({
    success: false,
    error: {
      message: ERROR_MESSAGES.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
    },
  });
};

