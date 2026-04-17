import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  logger.error('unhandled_error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });

  const status = err.statusCode ?? 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}
