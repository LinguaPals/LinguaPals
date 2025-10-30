import Notification from "../models/notificationModel.js";
import { on } from "../lib/events.js";
import { getWeekTag } from "../utils/dateIds.js";
import { getMatchForUser } from "./matchService.js";

on("VIDEO_UPLOADED", async ({ userId, post }) => {
  const weekTag = getWeekTag();
  const m = await getMatchForUser(userId, weekTag);
  if (!m || !m.partnerId) return;
  await Notification.create({ userId: m.partnerId, event: "VIDEO_UPLOADED", meta: { postId: post._id, fromUserId: userId, weekTag } });
});

export default {};
