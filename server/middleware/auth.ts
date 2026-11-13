import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mealmate_super_secret_jwt_token_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'seller' | 'admin';
    name: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Check if session user header exists for simplicity / mock transitions
    const fallbackUserId = req.headers['x-user-id'] as string;
    const fallbackUserRole = req.headers['x-user-role'] as any;
    if (fallbackUserId && fallbackUserRole) {
      req.user = {
        id: fallbackUserId,
        email: 'user@mealmate.com',
        role: fallbackUserRole,
        name: 'Active User'
      };
      return next();
    }
    return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired authentication token.' });
    }
    req.user = decoded;
    next();
  });
};

export const requireRole = (allowedRoles: ('customer' | 'seller' | 'admin')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Portal restricted to ${allowedRoles.join('/')} accounts.` 
      });
    }
    next();
  };
};

