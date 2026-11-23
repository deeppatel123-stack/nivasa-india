import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const defaultDataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data');
const dataDir = env.dataDir ? path.resolve(env.dataDir) : defaultDataDir;
const safeName = /^[a-z][a-z0-9_-]*$/i;

function collectionPath(collection) {
  const name = String(collection ?? '');
  if (!safeName.test(name)) throw new Error(`Invalid collection name: ${name}`);
  return path.join(dataDir, `${name}.json`);
}

/** Generic, deliberately small JSON-file store used when no database is configured. */
export function readCollection(collection) {
  try {
    const filePath = collectionPath(collection);
    if (!fs.existsSync(filePath)) return [];
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Append or replace one record in a collection. Records are matched by the
 * supplied keys (default: `id`); omitted keys mean a new record is appended.
 */
export function writeCollection(collection, record, matchKeys = ['id']) {
  const filePath = collectionPath(collection);
  if (!record || typeof record !== 'object') throw new Error('A record object is required.');

  fs.mkdirSync(dataDir, { recursive: true });
  const existing = readCollection(collection);
  const keys = Array.isArray(matchKeys) ? matchKeys : [matchKeys];
  const index = existing.findIndex((item) =>
    keys.some((key) => item?.[key] != null && record[key] != null && item[key] === record[key]),
  );

  if (index >= 0) existing[index] = record;
  else existing.push(record);

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf8');
  return record;
}

/** Backwards-compatible helpers for owner submissions. */
export function readSubmissions() {
  return readCollection('submissions');
}

export function writeSubmission(record) {
  return writeCollection('submissions', record, ['externalId']);
}
