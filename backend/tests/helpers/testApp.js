import crypto from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Isolate every test file in its own JSON store before the app modules load.
export const testDataDir = mkdtempSync(
  path.join(tmpdir(), `nivasa-api-${process.pid}-${crypto.randomUUID()}-`),
);
process.env.NIVASA_DATA_DIR = testDataDir;
