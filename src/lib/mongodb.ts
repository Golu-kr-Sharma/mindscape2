import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI?.trim();

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable in Vercel or local environment.');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);

// Use a global variable so that the client is cached across module reloads
// in development (HMR). This avoids creating new connections on every change.
if (!globalThis._mongoClientPromise) {
  globalThis._mongoClientPromise = client.connect();
}

export async function connectToDatabase(): Promise<Db> {
  const mongoClient = await globalThis._mongoClientPromise!;
  return mongoClient.db();
}
