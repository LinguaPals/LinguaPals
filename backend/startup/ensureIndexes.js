// backend/startup/ensureIndexes.js (ESM)
export async function ensureIndexes(db) {
  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true, name: "uniq_email" });
  await users.createIndex(
    { firebaseUid: 1 },
    { unique: true, sparse: true, name: "uniq_firebaseUid" }
  );
}
