import { asyncHandler } from '../../common/asyncHandler.js';
import { getCurrentUser, loginUser, registerUser } from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const result = await registerUser({ name, email, password, role });
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser({ email, password });
  res.status(200).json(result);
});

export const me = asyncHandler(async (req, res) => {
  const user = getCurrentUser(req.user.id);
  res.status(200).json(user);
});
