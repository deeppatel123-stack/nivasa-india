import 'dotenv/config';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

await connectDatabase();

const server = app.listen(PORT, () => {
  console.info(`[api] Nivasa API listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.info(`[api] ${signal} received — shutting down.`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
