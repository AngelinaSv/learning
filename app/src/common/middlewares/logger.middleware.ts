import type { NextFunction, Request, Response } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}
