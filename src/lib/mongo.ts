import { attachDatabasePool } from "@vercel/functions";
import { MongoClient, type MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";

/**
 * Serverless-friendly settings: Vercel starts and freezes many short-lived instances,
 * so keep each instance's pool small, drop idle sockets, and fail fast so the caller can retry.
 */
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 60_000,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  retryReads: true,
  retryWrites: true,
  appName: "pizzahub-client",
};

const globalForMongo = globalThis as unknown as { _mongoClient?: MongoClient };

// Reuse one client per instance (hot reloads in dev, warm invocations on Vercel)
export const mongoClient = globalForMongo._mongoClient ?? new MongoClient(uri, options);
if (!globalForMongo._mongoClient) {
  globalForMongo._mongoClient = mongoClient;
  // On Vercel, closes idle connections cleanly before the instance is suspended (no-op elsewhere)
  attachDatabasePool(mongoClient);
}

export const db = mongoClient.db(process.env.DB_NAME ?? "pizzahub");
