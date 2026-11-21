import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const globalForMongo = globalThis as unknown as { _mongoClient?: MongoClient };

// Reuse one client across hot reloads / serverless invocations
export const mongoClient = globalForMongo._mongoClient ?? new MongoClient(uri);
if (process.env.NODE_ENV !== "production") globalForMongo._mongoClient = mongoClient;

export const db = mongoClient.db(process.env.DB_NAME ?? "pizzahub");
