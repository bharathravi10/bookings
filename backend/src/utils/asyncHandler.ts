import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Wraps async route handlers to catch errors and pass them to error handler
 * Eliminates need for try-catch blocks in every controller
 */
export const asyncHandler = (
  fn: (req: AuthRequest | Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request | AuthRequest, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

