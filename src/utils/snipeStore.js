/**
 * -----------------------------------------------------------
 * SmokeLog - Utility: Snipe Store
 * -----------------------------------------------------------
 *
 * Description: Stores the most recently deleted message per
 *              channel for use with the /snipe command.
 *              Automatically clears after timeout or usage.
 *
 * Usage:
 *   const { saveSnipe, getSnipe, clearSnipe } = require("./snipeStore");
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

const snipes = new Map();
const timeouts = new Map();
const logger = require("./logger");

const SNIPE_LIFETIME = 60_000; // 60 seconds

function saveSnipe(channelId, data) {
  if (timeouts.has(channelId)) {
    clearTimeout(timeouts.get(channelId));
    timeouts.delete(channelId);
  }

  snipes.set(channelId, data);

  const timeout = setTimeout(() => {
    snipes.delete(channelId);
    timeouts.delete(channelId);
    logger.info(`🧹 Cleared expired snipe from channel ${channelId}`);
  }, SNIPE_LIFETIME);

  timeouts.set(channelId, timeout);
  logger.info(`📌 Stored snipe in channel ${channelId} from ${data.authorTag}`);
}

function getSnipe(channelId) {
  return snipes.get(channelId);
}

function clearSnipe(channelId) {
  snipes.delete(channelId);
  if (timeouts.has(channelId)) {
    clearTimeout(timeouts.get(channelId));
    timeouts.delete(channelId);
  }
  logger.info(`🧼 Cleared snipe manually from channel ${channelId}`);
}

module.exports = {
  saveSnipe,
  getSnipe,
  clearSnipe,
};
