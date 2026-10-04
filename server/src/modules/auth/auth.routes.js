import express from 'express';
import { login, me, register } from './auth.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { validateLoginInput, validateRegisterInput } from './auth.validators.js';
import authenticate from '../../common/middleware/authenticate.js';

const router = express.Router();

router.post('/register', validate(validateRegisterInput), register);
router.post('/login', validate(validateLoginInput), login);
router.get('/me', authenticate, me);

export default router;
