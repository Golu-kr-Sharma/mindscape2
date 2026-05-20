import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();

if (!uri) {
  throw new Error(
    "❌ Please define the MONGODB_URI environment variable in .env.local"
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable
  // so MongoDB connection is not recreated on every reload

  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);

    console.log("🔄 Connecting to MongoDB...");

    global._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log("✅ MongoDB Connected Successfully");
        return client;
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Failed:");
        console.error(error);
        throw error;
      });
  }

  clientPromise = global._mongoClientPromise;
} else {
  // Production mode
  client = new MongoClient(uri);

  clientPromise = client
    .connect()
    .then((client) => {
      console.log("✅ MongoDB Connected Successfully");
      return client;
    })
    .catch((error) => {
      console.error("❌ MongoDB Connection Failed:");
      console.error(error);
      throw error;
    });
}

export async function connectToDatabase(): Promise<Db> {
  try {
    const mongoClient = await clientPromise;

    // If DB name exists in URI, this works automatically
    const db = mongoClient.db();

    console.log("📦 Database Connected");

    return db;
  } catch (error) {
    console.error("❌ Database Connection Error:");
    console.error(error);
    throw error;
  }
}