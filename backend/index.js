import "./loadEnviroment.js";

import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.ATLAS_URI;

if (!uri) {
  console.error("❌ Missing ATLAS_URI in .env file");
  process.exit(1);
}

const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB Atlas!");

    // Try listing databases to confirm the connection
    const databases = await client.db().admin().listDatabases();
    console.log("Databases:");
    databases.databases.forEach(db => console.log(` - ${db.name}`));
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

testConnection();
