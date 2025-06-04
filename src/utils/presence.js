/**
 * -----------------------------------------------------------
 * SmokeLog - Presence Utility
 * -----------------------------------------------------------
 *
 * Description: Handles bot status and activity (rich presence)
 *              setup and randomized rotation for the Discord bot.
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

const logger = require("../utils/logger");
const presences = require("../../data/presences.json");

function getRandomPresence() {
  if (!Array.isArray(presences) || presences.length === 0) return null;
  const entry = presences[Math.floor(Math.random() * presences.length)];
  return entry?.name && typeof entry.type === "number" ? entry : null;
}

function rotatePresence(client) {
  if (!client || !client.user) return;

  const presence = getRandomPresence();
  if (!presence) {
    logger.warning("⛔ No valid presence entries available.");
    return;
  }

  client.user.setPresence({
    activities: [{ name: presence.name, type: presence.type }],
    status: "online",
  });

  logger.info(`🎯 Rotated presence to: ${presence.name}`);
}

function startPresenceRotation(client, interval = 1800000) {
  rotatePresence(client); // Set initial presence
  setInterval(() => rotatePresence(client), interval);
}

module.exports = { startPresenceRotation };
