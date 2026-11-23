import { badRequest } from '../utils/errors.js';
import { emailField, messageField, nameField, phoneField, textField } from './fields.js';

// The contact page's categories, plus common aliases for API clients.
const SUBJECTS = new Set([
  'search',
  'data',
  'owner',
  'bug',
  'privacy',
  'other',
  'general',
  'support',
  'question',
  'feedback',
]);

export function validateContact(body = {}) {
  if (!SUBJECTS.has(body.subject)) {
    throw badRequest('Choose a valid subject from the supported contact categories.');
  }
  return {
    name: nameField(body.name),
    email: emailField(body.email),
    subject: body.subject,
    context: textField(body.context, 'Context', { min: 0, max: 200, required: false }) || '',
    message: messageField(body.message),
  };
}

export function validateEnquiry(body = {}) {
  return {
    listingId: textField(body.listingId, 'Listing id', { max: 120 }),
    listingTitle: textField(body.listingTitle, 'Listing title', { max: 200 }),
    name: nameField(body.name),
    email: emailField(body.email),
    phone: phoneField(body.phone),
    message: messageField(body.message),
  };
}
