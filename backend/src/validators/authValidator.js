import { badRequest } from '../utils/errors.js';
import { emailField, loginPasswordField, nameField, passwordField } from './fields.js';

export const ROLES = ['student', 'professional', 'owner', 'admin'];
const ROLE_SET = new Set(ROLES);
const LEGACY_ROLE_MAP = { seeker: 'student', landlord: 'owner' };

export function normalizeRole(value) {
  const role = typeof value === 'string' ? value.trim().toLowerCase() : '';
  const normalized = LEGACY_ROLE_MAP[role] || role;
  return ROLE_SET.has(normalized) ? normalized : null;
}

export function validateRegister(body = {}) {
  const role = normalizeRole(body.role);
  if (!role || role === 'admin') {
    throw badRequest('Choose a valid account type: student, working professional, or property owner.');
  }
  return {
    name: nameField(body.name),
    email: emailField(body.email),
    password: passwordField(body.password),
    role,
  };
}

export function validateLogin(body = {}) {
  return {
    email: emailField(body.email),
    password: loginPasswordField(body.password),
  };
}

export function validateForgotPassword(body = {}) {
  return { email: emailField(body.email) };
}
