import { badRequest } from '../utils/errors.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL = /(?:https?:\/\/|ftp:\/\/|www\.)/i;

/** Reject values that are links rather than human-entered content. */
export function rejectUrls(value, field) {
  if (URL.test(String(value ?? ''))) throw badRequest(`${field} must not contain a URL.`);
  return value;
}

export function textField(value, field, { min = 1, max = 160, required = true, allowUrls = false } = {}) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    if (!required) return null;
    throw badRequest(`${field} is required.`);
  }
  if (trimmed.length < min || trimmed.length > max) {
    throw badRequest(`${field} must be between ${min} and ${max} characters.`);
  }
  return allowUrls ? trimmed : rejectUrls(trimmed, field);
}

export function emailField(value, field = 'Email') {
  const trimmed = String(value ?? '').trim().toLowerCase();
  if (trimmed.length > 254 || !EMAIL.test(trimmed) || URL.test(trimmed)) {
    throw badRequest(`${field} must be a valid email address.`);
  }
  return trimmed;
}

export function nameField(value, field = 'Name') {
  return textField(value, field, { min: 2, max: 80 });
}

export function messageField(value, field = 'Message') {
  return textField(value, field, { min: 10, max: 2000 });
}

export function passwordField(value, field = 'Password', { min = 8 } = {}) {
  const password = String(value ?? '');
  if (password.length < min || password.length > 200) {
    throw badRequest(`${field} must be at least ${min} characters.`);
  }
  return password;
}

export function loginPasswordField(value) {
  const password = String(value ?? '');
  if (!password) throw badRequest('Password is required.');
  return password;
}

export function phoneField(value, field = 'Phone') {
  const phone = String(value ?? '').trim();
  if (!phone) return null;
  if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(phone)) {
    throw badRequest(`${field} must be a valid Indian mobile number.`);
  }
  return phone;
}
