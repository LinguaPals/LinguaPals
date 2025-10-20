// backend/db/conn.js
import { MongoClient } from "mongodb";

const uri = process.env.ATLAS_URI;
if (!uri) throw new Error("Missing ATLAS_URI in environment");

const client = new MongoClient(uri, {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
});

let _db = null;

export async function connectDB() {
  if (_db) return _db;
  await client.connect();
  const dbName = process.env.DB_NAME || "linguapals";
  _db = client.db(dbName);
  return _db;
}

export function getDb() {
  if (!_db) throw new Error("DB not connected yet");
  return _db;
}

export function getClient() {
  return client;
}

// (Optional convenience) direct accessor for 'users' collection.
export function getUsersCollection() {
  return getDb().collection("users");
}
