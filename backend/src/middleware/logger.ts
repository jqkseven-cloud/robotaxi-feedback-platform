import type { Request, Response, NextFunction } from 'express';

type LogLevel = 'info' | 'warn' | 'error';

function emit(level: LogLevel, message: string, extra?: Record<string, unknown>) {
  const entry = JSON.stringify({ level, time: new Date().toISOString(), message, ...extra });
  if (level === 'error') {
    console.error(entry);
  } else {
    console.log(entry);
  }
}

export const logger = {
  info: (message: string, extra?: Record<string, unknown>) => emit('info', message, extra),
  warn: (message: string, extra?: Record<string, unknown>) => emit('warn', message, extra),
  error: (message: string, extra?: Record<string, unknown>) => emit('error', message, extra),
};

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
}
