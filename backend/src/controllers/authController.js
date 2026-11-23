import { asyncHandler } from '../utils/asyncHandler.js';
import { fileStorageLabel } from '../utils/storage.js';
import { validateForgotPassword, validateLogin, validateRegister } from '../validators/authValidator.js';
import { loginAccount, registerAccount, toPublicUser, withTokenNotice } from '../services/authService.js';

export const registerController = asyncHandler(async (req, res) => {
  const session = await registerAccount(validateRegister(req.body));
  return res.status(201).json(withTokenNotice(session));
});

export const loginController = asyncHandler(async (req, res) => {
  const session = await loginAccount(validateLogin(req.body));
  return res.json(withTokenNotice(session));
});

export const meController = asyncHandler(async (req, res) => {
  return res.json({ user: toPublicUser(req.user), storage: fileStorageLabel() });
});

/**
 * Mail delivery is intentionally not connected. This endpoint never creates a
 * reset token and never claims that an email was sent.
 */
export const forgotPasswordController = asyncHandler(async (req, res) => {
  validateForgotPassword(req.body);
  return res.json({
    ok: true,
    delivery: 'not-configured',
    message: 'Password reset email delivery is not configured; no email was sent.',
  });
});
