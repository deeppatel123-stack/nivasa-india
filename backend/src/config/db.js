import mongoose from 'mongoose';
import { env } from './env.js';

export const dbState = {
  configured: Boolean(env.mongoUri),
  connected: false,
};

/** Persistence is optional: the API still serves genuine OSM-discovered records without Mongo. */
export async function connectDatabase() {
  if (!env.mongoUri) {
    console.info('[db] MONGODB_URI is not set — operating without persistence.');
    return;
  }

  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    dbState.connected = true;
    console.info('[db] Connected to MongoDB.');
  } catch (error) {
    dbState.connected = false;
    console.warn(`[db] Connection failed (${error.message}); continuing without persistence.`);
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  dbState.connected = false;
}
