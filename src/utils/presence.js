/**
 * -----------------------------------------------------------
 * SmokeLog - Presence Utility
 * -----------------------------------------------------------
 *
 * Description: Handles bot status and activity (rich presence)
 *              setup and rotation for the Discord bot.
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

const statuses = [
  { name: "Heating the quartz 🔥", type: 0 }, // Playing
  { name: "Packing a fat bowl 🍚", type: 0 }, // Playing
  { name: "a sesh playlist 🎶", type: 2 }, // Listening
  { name: "the clouds roll in ☁️", type: 3 }, // Watching
  { name: "Rolling one up 🌯", type: 0 }, // Playing
  { name: "BRB taking a dab 🫡", type: 0 }, // Playing
  { name: "the leaderboard get baked 🥇", type: 3 }, // Watching
  { name: "Trying not to cough 😶‍🌫️", type: 0 }, // Playing
];

let current = 0;

function rotatePresence(client) {
  if (!client || !client.user) return;

  const status = statuses[current % statuses.length];
  client.user.setPresence({
    activities: [status],
    status: "online",
  });

  current++;
}

function startPresenceRotation(client, interval = 1800000) {
  rotatePresence(client); // Set initial
  setInterval(() => rotatePresence(client), interval);
}

module.exports = { startPresenceRotation };
