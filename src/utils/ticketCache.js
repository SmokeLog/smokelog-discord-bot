/**
 * -----------------------------------------------------------
 * SmokeLog - Ticket Cache (Persistent)
 * -----------------------------------------------------------
 *
 * Description: Tracks open ticket channels by user ID using
 *              Firebase Firestore under `discord/tickets`.
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

const COLLECTION_PATH = "discord/tickets";

async function hasTicket(userId) {
  const doc = await db.collection(COLLECTION_PATH).doc(userId).get();
  return doc.exists;
}

async function getTicketChannelId(userId) {
  const doc = await db.collection(COLLECTION_PATH).doc(userId).get();
  return doc.exists ? doc.data().channelId : null;
}

async function registerTicket(userId, channelId) {
  await db.collection(COLLECTION_PATH).doc(userId).set({
    userId,
    channelId,
    openedAt: new Date().toISOString(),
  });
  logger.info(`🎟️ Registered ticket for ${userId} in channel ${channelId}`);
}

async function closeTicket(userId) {
  await db.collection(COLLECTION_PATH).doc(userId).delete();
  logger.info(`❌ Closed ticket for ${userId}`);
}

async function entries() {
  const snapshot = await db.collection(COLLECTION_PATH).get();
  return snapshot.docs.map((doc) => [doc.id, doc.data().channelId]);
}

module.exports = {
  hasTicket,
  getTicketChannelId,
  registerTicket,
  closeTicket,
  entries,
};
