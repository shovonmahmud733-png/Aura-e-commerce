import jwt from 'jsonwebtoken';
import { findUserById } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aura-commerce-ultra-secure-jwt-secret-key-2026';

/**
 * Middleware to require valid JWT authentication
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Session token invalid or expired. Please sign in again.' });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'This account has been suspended. Please contact customer support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({ error: 'Internal authorization error.' });
  }
}

/**
 * Middleware to require administrator privileges (role === 'admin')
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const role = (req.user.role || '').toLowerCase();
  if (role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Administrator privileges required.',
      code: 'FORBIDDEN_NOT_ADMIN'
    });
  }

  next();
}
