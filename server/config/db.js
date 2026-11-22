import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI?.trim() || '';

export const dbState = {
  configured: Boolean(MONGODB_URI),
  connected: false,
  mode: MONGODB_URI ? 'mongodb' : 'demo-memory',
};

/**
 * MongoDB is optional. When MONGODB_URI is absent the API serves the same
 * labelled demo dataset straight from the shared module, so the project runs
 * without any external service.
 */
export async function connectDatabase() {
  if (!MONGODB_URI) {
    console.info('[db] MONGODB_URI is not set — serving labelled demo listings from memory.');
    return;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  dbState.connected = true;
  console.info('[db] Connected to MongoDB.');
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  dbState.connected = false;
}
