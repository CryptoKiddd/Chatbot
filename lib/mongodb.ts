// ==================== lib/mongodb.ts ====================
import { MongoClient, Db } from 'mongodb';
 console.log("loooog",process.env.MONGODB_URI)
if (!process.env.MONGODB_URI) {
 
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = { maxPoolSize: 10 };

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const log = (message: string) => {
  console.log(`[MongoDB] ${message}`);
};

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    log('Initializing new MongoDB connection (development)...');

    client = new MongoClient(uri, options);

    globalWithMongo._mongoClientPromise = client
      .connect()
      .then((client) => {
        log('✅ Connected successfully (development)');
        return client;
      })
      .catch((err) => {
        console.error('[MongoDB] ❌ Connection failed (development)', err);
        throw err;
      });
  } else {
    log('Reusing existing MongoDB connection (development)');
  }

  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  log('Initializing MongoDB connection (production)...');

  client = new MongoClient(uri, options);

  clientPromise = client
    .connect()
    .then((client) => {
      log('✅ Connected successfully (production)');
      return client;
    })
    .catch((err) => {
      console.error('[MongoDB] ❌ Connection failed (production)', err);
      throw err;
    });
}

export async function getDatabase(): Promise<Db> {
  log('Accessing database instance...');
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'realestate');
}

export default clientPromise;
