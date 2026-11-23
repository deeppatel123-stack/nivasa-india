import crypto from 'node:crypto';
import { readCollection, writeCollection } from '../utils/fileStore.js';
import { fileStorageLabel } from '../utils/storage.js';

const SUBMISSIONS = 'submissions';

function toRecord(input, ownerId = null) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  // Pending owner submissions never enter the public listing search.
  return {
    ...input,
    id,
    externalId: `owner:${id}`,
    slug: `owner:${id}`,
    provider: 'owner_submission',
    description: input.description || 'Owner-submitted accommodation record. Fields not supplied are shown as "Not available".',
    images: [],
    source: { name: 'Owner submission', url: '', licence: 'Submitted by property owner/manager', fetchedAt: now },
    verification: 'unverified',
    availability: 'unconfirmed',
    quality: 'information_incomplete',
    tags: ['owner-submission', 'pending-moderation'],
    isDemo: false,
    status: 'pending',
    published: false,
    ownerId,
    moderation: 'pending',
    submittedAt: now,
  };
}

export function createSubmission(body, ownerId = null) {
  const storage = fileStorageLabel();
  const record = toRecord(body, ownerId);
  writeCollection(SUBMISSIONS, record);
  return { record, storage };
}

export function listSubmissions(ownerId) {
  if (!ownerId) return [];
  return readCollection(SUBMISSIONS).filter((item) => item.ownerId === ownerId);
}
