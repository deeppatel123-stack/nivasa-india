import { forbidden, unauthorized } from '../utils/errors.js';
import { getUserById, toPublicUser, verifyToken } from '../services/authService.js';

function bearerToken(req) {
  const header = String(req.get('authorization') || '').trim();
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

function userFromToken(token) {
  const payload = verifyToken(token);
  const user = getUserById(payload.sub);
  if (!user) throw new Error('Account no longer exists.');
  return toPublicUser(user);
}

/** Required authentication for account-scoped routes. */
export function requireAuth(req, _res, next) {
  const token = bearerToken(req);
  if (!token) return next(unauthorized('A Bearer token is required.'));
  try {
    req.user = userFromToken(token);
    return next();
  } catch {
    return next(unauthorized('Invalid or expired token.'));
  }
}

/** Attaches a user when a valid token is present, but never blocks the request. */
export function optionalAuth(req, _res, next) {
  const token = bearerToken(req);
  if (token) {
    try {
      req.user = userFromToken(token);
    } catch {
      // Anonymous enquiries are allowed; an unusable optional token is ignored.
    }
  }
  return next();
}

/** Requires an authenticated user with one of the allowed roles. */
export function requireRole(...roles) {
  const allowed = new Set(roles.flat().filter(Boolean));
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized('A Bearer token is required.'));
    if (allowed.size > 0 && !allowed.has(req.user.role)) {
      return next(forbidden('You do not have permission to access this resource.'));
    }
    return next();
  };
}
