import { env, isProduction } from '../config/env.js';
import { unavailable } from './errors.js';

/**
 * Label the persistence actually used. These account/message records always go
 * to the local JSON store, including when Mongo is available for listings, so
 * the response never claims a write that did not happen.
 */
export function fileStorageLabel() {
  if (isProduction && !env.allowFileStorageInProduction) {
    throw unavailable(
      'File persistence is disabled in production. Configure MongoDB or set ALLOW_FILE_STORAGE_IN_PRODUCTION=true explicitly.',
    );
  }
  return isProduction ? 'file' : 'local-development-file';
}
