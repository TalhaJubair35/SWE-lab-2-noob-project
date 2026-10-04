import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import AppError from '../AppError.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
};

export default authenticate;
