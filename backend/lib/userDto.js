// backend/lib/userDto.js (ESM)
export function toUserDTO(doc) {
  if (!doc) return null;
  return {
    id: doc._id?.toString?.() || null,
    firebaseUid: doc.firebaseUid || null,
    email: doc.email || null,
    name: doc.name ?? null,
    avatarUrl: doc.avatarUrl ?? null,
    locale: doc.locale ?? null,
    timezone: doc.timezone ?? null,
    role: doc.role || "user",
    status: doc.status || "active",
    lastLoginAt: doc.lastLoginAt || null,
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
}
