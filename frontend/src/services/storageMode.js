const LABELS = {
  mongodb: 'MongoDB',
  'local-development-file': 'Local development file',
  'local-file': 'Local development file',
  file: 'Local development file',
};

/** Render the persistence mode reported by the API without inventing a value. */
export function formatStorageMode(value) {
  if (typeof value !== 'string' || !value.trim()) return 'Not available';
  return LABELS[value] ?? value;
}
