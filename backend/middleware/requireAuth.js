import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ success: false, message: "Unauthorized" });
    const token = parts[1];
    const secret = process.env.JWT_SECRET || "dev_secret";
    const decoded = jwt.verify(token, secret);
    const uid = decoded.userID || decoded.userId || decoded.uid || null;
    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });
    req.userId = uid;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
