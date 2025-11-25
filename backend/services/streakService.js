import User from "../models/userModel.js";
import { getDateId } from "../utils/dateIds.js";
import { on } from "../lib/events.js";

/**
 * Calculates the difference in days between two date IDs (YYYY-MM-DD format)
 * @param {string} dateId1 - First date ID
 * @param {string} dateId2 - Second date ID
 * @returns {number} Difference in days (dateId2 - dateId1)
 */
export const getDaysDifference = (dateId1, dateId2) => {
  if (!dateId1 || !dateId2) return null;
  const date1 = new Date(dateId1 + "T00:00:00Z");
  const date2 = new Date(dateId2 + "T00:00:00Z");
  const diffTime = date2 - date1;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Updates user streak based on their post activity
 * @param {string} userId - The user's ID
 * @param {string} currentDateId - The date ID of the current post
 * @returns {Object} Updated streak info { streakCount, lastUploadDateId }
 */
export const updateStreak = async (userId, currentDateId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const lastDateId = user.lastUploadDateId;
  
  // If user already posted today, no streak change
  if (lastDateId === currentDateId) {
    return { streakCount: user.streakCount, lastUploadDateId: user.lastUploadDateId };
  }

  let newStreakCount;
  
  if (!lastDateId) {
    // First post ever - start streak at 1
    newStreakCount = 1;
  } else {
    const daysDiff = getDaysDifference(lastDateId, currentDateId);
    
    if (daysDiff === 1) {
      // Consecutive day - increment streak
      newStreakCount = user.streakCount + 1;
    } else if (daysDiff === 0) {
      // Same day (shouldn't reach here due to earlier check)
      newStreakCount = user.streakCount;
    } else {
      // Missed one or more days - reset streak to 1
      newStreakCount = 1;
    }
  }

  // Update user in database
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { 
      streakCount: newStreakCount, 
      lastUploadDateId: currentDateId 
    },
    { new: true }
  );

  return { 
    streakCount: updatedUser.streakCount, 
    lastUploadDateId: updatedUser.lastUploadDateId 
  };
};

/**
 * Gets the current streak info for a user
 * @param {string} userId - The user's ID
 * @returns {Object} Current streak info
 */
export const getStreakInfo = async (userId) => {
  const user = await User.findById(userId).select("streakCount lastUploadDateId");
  if (!user) {
    throw new Error("User not found");
  }
  return { 
    streakCount: user.streakCount, 
    lastUploadDateId: user.lastUploadDateId 
  };
};

/**
 * Initialize event listener for VIDEO_UPLOADED events
 */
export const initStreakEvents = () => {
  on("VIDEO_UPLOADED", async ({ userId, post }) => {
    try {
      const dateId = post.dateId || getDateId();
      await updateStreak(userId, dateId);
    } catch (error) {
      console.error("Error updating streak on video upload:", error);
    }
  });
};

export default { updateStreak, getStreakInfo, getDaysDifference, initStreakEvents };
