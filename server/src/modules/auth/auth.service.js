import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import AppError from '../../common/AppError.js';
import { create, findByEmail, findById } from './user.repository.js';

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
};

const signToken = (id, role) => {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerUser = async ({ name, email, password, role }) => {
  const normalizedName = String(name).trim();
  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = findByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = create({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
    role,
  });

  const user = findById(userId);
  const token = signToken(user.id, user.role);

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = findByEmail(normalizedEmail);

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = signToken(user.id, user.role);

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getCurrentUser = (userId) => {
  const user = findById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return sanitizeUser(user);
};
