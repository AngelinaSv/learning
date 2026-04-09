import { ERROR_MESSAGES, ERROR_CODES } from '../constants/errors/file.errors.js';

export const validateQuota = (req, res, next) => {
  const { quota } = req.body;

  if (!quota || typeof quota !== 'number' || quota <= 0) {
    return res.status(400).json({
      success: false,
      error: { message: ERROR_MESSAGES.INVALID_QUOTA, code: ERROR_CODES.INVALID_QUOTA },
    });
  }

  next();
};
