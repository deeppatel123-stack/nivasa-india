import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { AppError } from './utils/errors.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(currentDir, '../../frontend/dist');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https://*.tile.openstreetmap.org'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: null,
        },
      },
    }),
  );
  app.use(cors({ origin: env.clientOrigins, credentials: true }));
  app.use(express.json({ limit: '64kb' }));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: env.nodeEnv === 'production' ? 120 : env.nodeEnv === 'test' ? 10000 : 1000,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  app.use('/api', apiRouter);
  app.use(express.static(clientDist, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((error, _req, res, _next) => {
    const status = error instanceof AppError ? error.status : 500;
    if (status >= 500) console.error('[api]', error);
    return res.status(status).json({
      error: status >= 500 ? 'Server error' : error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  });
  return app;
}
