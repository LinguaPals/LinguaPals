// backend/routes/auth.js (ESM)
import express from "express";
import { verifyIdToken } from "../lib/firebaseAdmin.js";
import { getDb } from "../db/conn.js";
import { toUserDTO } from "../lib/userDto.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// POST /auth/session
// Header: Authorization: Bearer <firebase_id_token>
router.post("/session", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const decoded = await verifyIdToken(authHeader);

    const db = getDb();
    const users = db.collection("users");

    const now = new Date();
    const email = (decoded.email || "").toLowerCase();
    const baseUpdate = {
      email: email || null,
      name: decoded.name || null,
      avatarUrl: decoded.picture || null,
      updatedAt: now,
    };

    let user =
      (decoded.uid && (await users.findOne({ firebaseUid: decoded.uid }))) ||
      (email && (await users.findOne({ email })));

    if (!user) {
      const doc = {
        firebaseUid: decoded.uid,
        role: "user",
        status: "active",
        lastLoginAt: now,
        createdAt: now,
        ...baseUpdate,
      };
      const result = await users.insertOne(doc);
      user = { _id: result.insertedId, ...doc };
    } else {
      const setFields = { ...baseUpdate, lastLoginAt: now };
      if (!user.firebaseUid && decoded.uid) setFields.firebaseUid = decoded.uid; // auto-link
      await users.updateOne({ _id: new ObjectId(user._id) }, { $set: setFields });
      user = { ...user, ...setFields };
    }

    return res.json({ user: toUserDTO(user) });
  } catch {
    return res
      .status(401)
      .json({ error: { code: "AUTH_INVALID", message: "Invalid or missing Firebase ID token" } });
  }
});

export default router;
