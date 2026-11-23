import crypto from 'node:crypto';
import { readCollection, writeCollection } from '../utils/fileStore.js';
import { fileStorageLabel } from '../utils/storage.js';
import { findUserByEmail } from './authService.js';

const CONTACTS = 'contacts';
const ENQUIRIES = 'enquiries';
const SUBMISSIONS = 'submissions';

export function createContact(input) {
  const storage = fileStorageLabel();
  const record = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    subject: input.subject,
    context: input.context,
    message: input.message,
    receivedAt: new Date().toISOString(),
  };
  writeCollection(CONTACTS, record);
  return { record, storage };
}

function findSubmission(listingId) {
  return (
    readCollection(SUBMISSIONS).find(
      (item) => item.id === listingId || item.externalId === listingId || item.slug === listingId,
    ) || null
  );
}

export function createEnquiry(input, identity = {}) {
  const storage = fileStorageLabel();
  const submission = findSubmission(input.listingId);
  const requester = identity.userId ? null : findUserByEmail(input.email);
  const requesterId = identity.userId || requester?.id || null;

  const record = {
    id: crypto.randomUUID(),
    listingId: input.listingId,
    listingTitle: input.listingTitle,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    receivedAt: new Date().toISOString(),
    ...(requesterId ? { requesterId } : {}),
    ...(submission?.ownerId ? { ownerId: submission.ownerId } : {}),
  };
  writeCollection(ENQUIRIES, record);
  return { record, storage };
}

export function listEnquiriesForUser(user) {
  if (!user?.id || !user?.email) return [];
  const email = String(user.email).toLowerCase();
  return readCollection(ENQUIRIES).filter(
    (item) =>
      item.requesterId === user.id ||
      item.ownerId === user.id ||
      String(item.email || '').toLowerCase() === email,
  );
}
