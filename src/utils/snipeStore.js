/**
 * -----------------------------------------------------------
 * SmokeLog - Utility: Snipe Store (Firestore)
 * -----------------------------------------------------------
 *
 * Description: Stores the most recently deleted message per
 *              channel for use with the /snipe command.
 *              Automatically clears after timeout or usage.
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

const { db } = require("../lib/firebase");
const logger = require("./logger");

const timeouts = new Map();
const SNIPE_LIFETIME = 60_000; // 60 seconds

function getSnipeDoc(channelId) {
  return db
    .collection("discord")
    .doc("snipes")
    .collection("channels")
    .doc(channelId);
}

async function saveSnipe(channelId, data) {
  const doc = getSnipeDoc(channelId);
  await doc.set(data);

  // Set timeout to auto-clear after SNIPE_LIFETIME
  if (timeouts.has(channelId)) {
    clearTimeout(timeouts.get(channelId));
    timeouts.delete(channelId);
  }

  const timeout = setTimeout(async () => {
    await doc.delete();
    timeouts.delete(channelId);
    logger.info(`🧹 Cleared expired snipe from channel ${channelId}`);
  }, SNIPE_LIFETIME);

  timeouts.set(channelId, timeout);
  logger.info(`📌 Stored snipe in channel ${channelId} from ${data.authorTag}`);
}

async function getSnipe(channelId) {
  const doc = await getSnipeDoc(channelId).get();
  return doc.exists ? doc.data() : null;
}

async function clearSnipe(channelId) {
  await getSnipeDoc(channelId).delete();
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
