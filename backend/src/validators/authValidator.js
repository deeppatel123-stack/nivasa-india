import { badRequest } from '../utils/errors.js';
import { emailField, loginPasswordField, nameField, passwordField } from './fields.js';

const ROLES = new Set(['seeker', 'owner']);

export function validateRegister(body = {}) {
  const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : '';
  if (!ROLES.has(role)) {
    throw badRequest('Choose whether you are looking for a place or listing a property.');
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
