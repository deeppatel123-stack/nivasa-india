import { emailField, loginPasswordField, nameField, passwordField } from './fields.js';

export function validateRegister(body = {}) {
  return {
    name: nameField(body.name),
    email: emailField(body.email),
    password: passwordField(body.password),
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
