/**
 * -----------------------------------------------------------
 * SmokeLog - Timezone Store Utility
 * -----------------------------------------------------------
 *
 * Description: Stores and retrieves user timezones from Firebase.
 *
 * Created by: GarlicRot
 * GitHub: https://github.com/GarlicRot
 * Website: https://www.smokelog.org
 *
 * -----------------------------------------------------------
 * © 2025 SmokeLog. All Rights Reserved.
 * -----------------------------------------------------------
 */

const { db } = require("../lib/firebase");
const logger = require("./logger");

const COLLECTION_NAME = "user_timezones";

/**
 * Save a user's timezone in Firestore
 * @param {string} userId - Discord user ID
 * @param {string} timezone - IANA timezone string (e.g., "America/Los_Angeles")
 */
async function setUserTimezone(userId, timezone) {
  try {
    await db.collection(COLLECTION_NAME).doc(userId).set({ timezone });
    logger.success(`🕓 Timezone saved for ${userId}: ${timezone}`);
  } catch (error) {
    logger.error(`❌ Failed to save timezone for ${userId}: ${error.message}`);
  }
}

/**
 * Retrieve a user's timezone from Firestore
 * @param {string} userId - Discord user ID
 * @returns {Promise<string|null>} - Timezone string or null if not set
 */
async function getUserTimezone(userId) {
  try {
    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();
    const timezone = doc.exists ? doc.data().timezone : null;
    logger.info(`🕓 Retrieved timezone for ${userId}: ${timezone || "none"}`);
    return timezone;
  } catch (error) {
    logger.error(`❌ Failed to get timezone for ${userId}: ${error.message}`);
    return null;
  }
}

module.exports = {
  setUserTimezone,
  getUserTimezone,
};
