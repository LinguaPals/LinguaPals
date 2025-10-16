// backend/lib/firebaseAdmin.js (ESM)
import admin from "firebase-admin";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return admin;

  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_SERVICE_ACCOUNT_PATH,
  } = process.env;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    const pk = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: pk,
      }),
    });
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fallbackPath = path.join(__dirname, "..", "config", "serviceAccountKey.json");
    const svcPath = FIREBASE_SERVICE_ACCOUNT_PATH
      ? (path.isAbsolute(FIREBASE_SERVICE_ACCOUNT_PATH)
          ? FIREBASE_SERVICE_ACCOUNT_PATH
          : path.resolve(process.cwd(), FIREBASE_SERVICE_ACCOUNT_PATH))
      : fallbackPath;
    const serviceAccount = require(svcPath); // safe in ESM via createRequire
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  initialized = true;
  return admin;
}

/**
 * Verifies a Firebase ID token (JWT) and returns the decoded payload.
 * Accepts either the raw token or an "Authorization: Bearer <token>" header value.
 */
export async function verifyIdToken(idToken) {
  const a = initFirebaseAdmin();
  const token = (idToken || "").startsWith("Bearer ") ? idToken.slice(7) : idToken;
  if (!token) {
    const err = new Error("Missing ID token");
    err.code = "AUTH_REQUIRED";
    throw err;
  }
  return a.auth().verifyIdToken(token);
}
