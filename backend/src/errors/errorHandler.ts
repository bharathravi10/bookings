import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from './ApiError';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../utils/constants';

export function errorHandler(
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    logger.warn('Validation error', {
      path: req.path,
      method: req.method,
      errors: err.errors,
    });
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Custom API errors
  if (err instanceof ApiError) {
    logger.error('API error', {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
    });
    res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Unknown errors
  logger.error('Unhandled error', err, {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
}

