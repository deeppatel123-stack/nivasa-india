import 'dotenv/config';

const positiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: positiveInt(process.env.PORT, 5000),
  mongoUri: (process.env.MONGODB_URI || '').trim(),
  // Local JSON storage directory (tests point this at a temporary folder).
  dataDir: (process.env.NIVASA_DATA_DIR || '').trim(),
  // Required in production for signed auth tokens. In development an explicitly
  // ephemeral in-memory secret is used instead, and responses say so.
  jwtSecret: (process.env.JWT_SECRET || '').trim(),
  // File persistence is a development fallback. Production must opt in explicitly.
  allowFileStorageInProduction: process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION === 'true',
  // Reserved for a future mail transport. No delivery is implemented: the
  // forgot-password endpoint always reports that no email was sent.
  mail: {
    host: (process.env.MAIL_HOST || '').trim(),
    port: positiveInt(process.env.MAIL_PORT, 587),
    from: (process.env.MAIL_FROM || '').trim(),
    user: (process.env.MAIL_USER || '').trim(),
    password: process.env.MAIL_PASSWORD || '',
  },
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:4173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  geocoderProvider: process.env.GEOCODER_PROVIDER || 'photon',
  photonUrl: (process.env.PHOTON_URL || 'https://photon.komoot.io').replace(/\/$/, ''),
  nominatimUrl: (process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org').replace(/\/$/, ''),
  googleMapsKey: (process.env.GOOGLE_MAPS_API_KEY || '').trim(),
  geocoderUserAgent:
    process.env.GEOCODER_USER_AGENT ||
    'Nivasa/1.0 (Indian rental discovery; contact: admin@nivasa.in)',
  geocodeCacheTtlMs: positiveInt(process.env.GEOCODE_CACHE_TTL_MS, 24 * 60 * 60 * 1000),
  discoveryCacheTtlMs: positiveInt(process.env.DISCOVERY_CACHE_TTL_MS, 15 * 60 * 1000),
  // OSMF Nominatim policy: absolute maximum 1 request/second. Stay below it.
  geocodeMinIntervalMs: positiveInt(process.env.GEOCODE_MIN_INTERVAL_MS, 1200),
  discoveryQueries: (process.env.DISCOVERY_QUERIES || 'hostel,guest house,student accommodation,pg accommodation')
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean),
  freshnessDays: positiveInt(process.env.FRESHNESS_DAYS, 30),
};

export const isProduction = env.nodeEnv === 'production';
