import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    console.log('=== BACKEND: Auth Middleware ===');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('Full header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid Bearer token found');
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    console.log('Token extracted:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    console.log('Token starts with eyJ:', token.startsWith('eyJ'));
    
    const payload = verifyToken(token);
    console.log('Token verified successfully');
    console.log('User ID:', payload.userId);
    console.log('Email:', payload.email);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    console.error('=== BACKEND: Token verification failed ===');
    console.error('Error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

