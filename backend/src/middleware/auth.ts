import { Request, Response, NextFunction } from 'express';
import { getAuthTokenFromRequest, verifyToken, TokenPayload } from '../lib/auth';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload | null;
}

export function extractUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = getAuthTokenFromRequest(req);
  req.user = token ? verifyToken(token) : null;
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = getAuthTokenFromRequest(req);
  const user = token ? verifyToken(token) : null;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }
  req.user = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = getAuthTokenFromRequest(req);
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
  }
  req.user = user;
  next();
}
