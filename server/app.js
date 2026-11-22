import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import listingsRouter from './routes/listings.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(currentDir, '../dist');

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '64kb' }));

app.use('/api/health', healthRouter);
app.use('/api/listings', listingsRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));

// In production Express also serves the built React app, making this a single MERN deploy.
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.get('/', (_req, res) => {
    res.type('text').send(
      'Nivasa API is running. Start the Vite dev server on port 5173 for the React client.',
    );
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
