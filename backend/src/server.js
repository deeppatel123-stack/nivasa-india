import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';

await connectDatabase();
const app = createApp();
const server = app.listen(env.port, () => {
  console.info(`[api] Nivasa API listening on port ${env.port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
