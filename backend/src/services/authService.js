import crypto from 'node:crypto';
import { env, isProduction } from '../config/env.js';
import { conflict, unauthorized, unavailable } from '../utils/errors.js';
import { readCollection, writeCollection } from '../utils/fileStore.js';
import { fileStorageLabel } from '../utils/storage.js';

const SCRYPT_KEY_LENGTH = 64;
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const USERS = 'users';

// Used only to keep the failure path for unknown emails doing comparable work.
const DUMMY_SALT = crypto.randomBytes(16);
const DUMMY_HASH = formatHash(
  DUMMY_SALT,
  crypto.scryptSync('not-a-real-password', DUMMY_SALT, SCRYPT_KEY_LENGTH),
);

let ephemeralSecret = null;

function formatHash(salt, derived) {
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEY_LENGTH, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return formatHash(salt, await deriveKey(password, salt));
}

export async function verifyPassword(password, storedHash) {
  try {
    const [algorithm, saltHex, hashHex] = String(storedHash || '').split('$');
    if (algorithm !== 'scrypt' || !/^[0-9a-f]+$/i.test(saltHex || '') || !/^[0-9a-f]+$/i.test(hashHex || '')) {
      return false;
    }
    const expected = Buffer.from(hashHex, 'hex');
    const actual = await deriveKey(password, Buffer.from(saltHex, 'hex'));
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function tokenSecret() {
  if (env.jwtSecret) return Buffer.from(env.jwtSecret, 'utf8');
  if (isProduction) {
    throw unavailable('JWT_SECRET is not configured; authentication tokens are unavailable.');
  }
  // Explicitly ephemeral: tokens stop working when this process restarts.
  if (!ephemeralSecret) ephemeralSecret = crypto.randomBytes(32);
  return ephemeralSecret;
}

export function tokenMode() {
  if (env.jwtSecret) return 'env-secret';
  if (isProduction) return 'unavailable';
  return 'ephemeral-dev';
}

export function withTokenNotice(response) {
  if (response.tokenMode !== 'ephemeral-dev') return response;
  return {
    ...response,
    warning: 'Development tokens are signed with an ephemeral in-memory secret and will stop working when the server restarts.',
  };
}

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const ROLE_MAP = {
  student: 'student',
  professional: 'professional',
  owner: 'owner',
  admin: 'admin',
  seeker: 'student',
  landlord: 'owner',
};

export function normalizeUserRole(role) {
  return ROLE_MAP[String(role || '').trim().toLowerCase()] || 'student';
}

export function issueToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: normalizeUserRole(user.role),
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  });
  const signature = crypto
    .createHmac('sha256', tokenSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token) {
  const parts = String(token ?? '').split('.');
  if (parts.length !== 3 || !parts.every(Boolean)) throw new Error('Malformed token.');

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  if (header.alg !== 'HS256' || header.typ !== 'JWT') throw new Error('Unsupported token.');

  const expected = crypto
    .createHmac('sha256', tokenSecret())
    .update(`${parts[0]}.${parts[1]}`)
    .digest();
  const supplied = Buffer.from(parts[2], 'base64url');
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    throw new Error('Invalid token signature.');
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('Invalid token subject.');
  if (typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) throw new Error('Expired token.');
  return payload;
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeUserRole(user.role),
    createdAt: user.createdAt || null,
  };
}

export function findUserByEmail(email) {
  const needle = String(email ?? '').trim().toLowerCase();
  return readCollection(USERS).find((user) => String(user.email).toLowerCase() === needle) || null;
}

export function getUserById(id) {
  if (!id) return null;
  return readCollection(USERS).find((user) => user.id === id) || null;
}

function sessionFor(user) {
  return {
    user: toPublicUser(user),
    token: issueToken(user),
  };
}

export async function registerAccount({ name, email, password, role }) {
  const storage = fileStorageLabel();
  if (findUserByEmail(email)) throw conflict('An account with this email already exists.');

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: await hashPassword(password),
    role: normalizeUserRole(role),
    createdAt: new Date().toISOString(),
  };
  writeCollection(USERS, user);
  return sessionFor(user);
}

export async function loginAccount({ email, password }) {
  fileStorageLabel();
  const user = findUserByEmail(email);
  const valid = await verifyPassword(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !valid) throw unauthorized('Invalid email or password.');
  return sessionFor(user);
}
