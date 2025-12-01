import User from "../models/userModel.js";
import { getDateId } from "../utils/dateIds.js";

/**
 * Handles the streak and progress logic when a user successfully posts.
 *
 * Updated behavior:
 * - Every post increments videoCount.
 * - Every time videoCount % 5 === 0, level increases by 1 (never decreases).
 * - First post of the day also increments streakCount (based on lastUploadDateId) and marks postedToday.
 *
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {Promise<{streakCount: number, level: number, postedToday: boolean, videoCount: number}>}
 */
export const handleSuccessfulPost = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }
  
  user.videoCount = (user.videoCount ?? 0) + 1;

  if (user.videoCount % 5 === 0) {
    user.level = Math.max(1, (user.level ?? 1) + 1);
  }
  
  const todayId = getDateId();
  const lastUploadDateId = user.lastUploadDateId;
  const firstPostToday = lastUploadDateId !== todayId;

  if (firstPostToday) {
    if (lastUploadDateId) {
      const lastUploadDate = new Date(`${lastUploadDateId}T00:00:00Z`);
      const todayDate = new Date(`${todayId}T00:00:00Z`);
      const diffDays = Math.floor((todayDate - lastUploadDate) / 86400000);

      if (diffDays > 1) {
        user.streakCount = 0;
      }
    }

    user.streakCount = (user.streakCount ?? 0) + 1;
    user.lastUploadDateId = todayId;
  }

  user.postedToday = true;

  await user.save();
  
  // Return current state (whether updated or not)
  return {
    streakCount: user.streakCount,
    level: user.level,
    postedToday: user.postedToday,
    videoCount: user.videoCount
  };
};

/**
 * Daily rollover function to reset postedToday flags and reset streaks when users miss a day.
 * 
 * Should be called once per day (e.g., at midnight server time via cron).
 * 
 * Logic:
 * - If user.postedToday === true:
 *   - Reset to false (they maintained their streak, no penalty)
 * - If user.postedToday === false:
 *   - Reset streakCount to 0
 * 
 * @returns {Promise<{processed: number, streaksReset: number}>}
 */
export const handleDailyStreakRollOver = async () => {
  const users = await User.find({});
  
  let processed = 0;
  let streaksReset = 0;
  
  for (const user of users) {
    processed++;
    
    if (user.postedToday === true) {
      // User posted yesterday - just reset the flag (streak continues)
      user.postedToday = false;
      await user.save();
    } else {
      // User did NOT post yesterday - break streak and reset flag
      user.streakCount = 0;
      streaksReset++;
      user.postedToday = false; // Ensure it's explicitly false
      await user.save();
    }
  }
  
  return {
    processed,
    streaksReset
  };
};

export default { handleSuccessfulPost, handleDailyStreakRollOver };