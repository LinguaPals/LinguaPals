// backend/middleware/requireFirebaseAuth.js (ESM)
import { verifyIdToken } from "../lib/firebaseAdmin.js";
import { getDb } from "../db/conn.js";
import { ObjectId } from "mongodb";

export default async function requireFirebaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const decoded = await verifyIdToken(authHeader);

    const db = getDb();
    const users = db.collection("users");
    const email = (decoded.email || "").toLowerCase();

    let user =
      (decoded.uid && (await users.findOne({ firebaseUid: decoded.uid }))) ||
      (email && (await users.findOne({ email })));

    if (!user) {
      const now = new Date();
      const doc = {
        firebaseUid: decoded.uid,
        email: email || null,
        name: decoded.name || null,
        avatarUrl: decoded.picture || null,
        role: "user",
        status: "active",
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
      };
      const result = await users.insertOne(doc);
      user = { _id: result.insertedId, ...doc };
    } else {
      await users.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: { lastLoginAt: new Date() } }
      );
    }

    req.user = user;
    req.firebase = decoded; // optional
    next();
  } catch {
    return res
      .status(401)
      .json({ error: { code: "AUTH_REQUIRED", message: "Authentication required" } });
  }
}
