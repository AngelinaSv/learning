import { ERROR_MESSAGES } from '../constants/errors/common.errors.js';

export const decodeIdParam = (req, res, next) => {
  if (req.params.id) {
    try {
      req.params.id = decodeURIComponent(req.params.id);
    } catch {
      return res.status(400).json({ message: ERROR_MESSAGES.INVALID_ID });
    }
  }
  next();
}
