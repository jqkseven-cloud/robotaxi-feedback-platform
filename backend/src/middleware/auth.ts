import type { Request, Response, NextFunction } from 'express';

/**
 * Checks Authorization: Bearer <INTERNAL_API_KEY> header.
 * If INTERNAL_API_KEY is not set the middleware is a no-op (open access).
 * Set INTERNAL_API_KEY in .env to protect routes in production.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    next();
    return;
  }

  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${expected}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
