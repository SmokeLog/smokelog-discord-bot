/**
 * -----------------------------------------------------------
 * SmokeLog - Message Cache Utility
 * -----------------------------------------------------------
 *
 * Description: Tracks which messages have been posted to
 *              avoid reposting duplicates during runtime.
 *
 * Created by: GarlicRot
 * GitHub: https://github.com/GarlicRot
 * SmokeLog GitHub: https://github.com/SmokeLog
 * Website: https://www.smokelog.org
 *
 * -----------------------------------------------------------
 * © 2025 SmokeLog. All Rights Reserved.
 * -----------------------------------------------------------
 */

const postedMessages = new Map();

function hasPosted(key) {
  return postedMessages.has(key);
}

function markPosted(key, messageId) {
  postedMessages.set(key, messageId);
}

function getPostedMessageId(key) {
  return postedMessages.get(key);
}

function clearPosted(key) {
  postedMessages.delete(key);
}

module.exports = {
  hasPosted,
  markPosted,
  getPostedMessageId,
  clearPosted,
};
