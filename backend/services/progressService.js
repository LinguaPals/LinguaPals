import User from "../models/userModel.js";

/**
 * Handles the streak and level logic when a user successfully posts.
 * 
 * MVP Logic:
 * - First post of the day (postedToday === false):
 *   - Increment streakCount by 1
 *   - If streakCount is divisible by 5, increment level by 1
 *   - Set postedToday = true
 * - Subsequent posts same day (postedToday === true):
 *   - Do nothing (streak/level already updated)
 * 
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {Promise<{streakCount: number, level: number, postedToday: boolean}>}
 */
export const handleSuccessfulPost = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }
  
  // Only update if this is the first post of the day
  if (!user.postedToday) {
    user.streakCount = (user.streakCount ?? 0) + 1;

    // Every 5th consecutive day, increase level
    if (user.streakCount % 5 === 0) {
      user.level = (user.level ?? 0) + 1;
    }

    user.postedToday = true;
    await user.save();
  }

  
  // Return current state (whether updated or not)
  return {
    streakCount: user.streakCount,
    level: user.level,
    postedToday: user.postedToday
  };
};

/**
 * Daily rollover function to reset postedToday flags and penalize users who didn't post.
 * 
 * Should be called once per day (e.g., at midnight server time via cron).
 * 
 * MVP Logic:
 * - If user.postedToday === true:
 *   - Reset to false (they maintained their streak, no penalty)
 * - If user.postedToday === false:
 *   - Reset streakCount to 0
 *   - Decrease level by 1 (but never below 0)
 * 
 * @returns {Promise<{processed: number, streaksReset: number, levelsPenalized: number}>}
 */
export const handleDailyStreakRollOver = async () => {
  const users = await User.find({});
  
  let processed = 0;
  let streaksReset = 0;
  let levelsPenalized = 0;
  
  for (const user of users) {
    processed++;
    
    if (user.postedToday === true) {
      // User posted yesterday - just reset the flag (streak continues)
      user.postedToday = false;
      await user.save();
    } else {
      // User did NOT post yesterday - break streak and penalize
      user.streakCount = 0;
      streaksReset++;
      
      if (user.level > 0) {
        user.level -= 1;
        levelsPenalized++;
      }
      
      user.postedToday = false; // Ensure it's explicitly false
      await user.save();
    }
  }
  
  return {
    processed,
    streaksReset,
    levelsPenalized
  };
};

export default { handleSuccessfulPost, handleDailyStreakRollOver };