import { Router } from 'express';
import {
  forgotPasswordController,
  loginController,
  meController,
  registerController,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);
authRouter.get('/me', requireAuth, meController);
authRouter.post('/forgot-password', forgotPasswordController);
