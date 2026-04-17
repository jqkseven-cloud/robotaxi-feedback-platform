import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid query parameters', details: formatZodError(result.error) });
      return;
    }
    res.locals.validatedQuery = result.data;
    next();
  };
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid request body', details: formatZodError(result.error) });
      return;
    }
    req.body = result.data;
    next();
  };
}

function formatZodError(err: ZodError) {
  return err.issues.map(e => ({ field: e.path.join('.'), message: e.message }));
}
