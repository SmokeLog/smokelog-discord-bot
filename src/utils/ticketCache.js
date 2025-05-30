/**
 * -----------------------------------------------------------
 * SmokeLog - Ticket Cache
 * -----------------------------------------------------------
 *
 * Description: Tracks open ticket channels by user ID.
 *              Prevents duplicates and enables interaction
 *              continuity after bot restarts (optional: disk).
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

const openTickets = new Map();

function hasTicket(userId) {
  return openTickets.has(userId);
}

function getTicketChannelId(userId) {
  return openTickets.get(userId);
}

function registerTicket(userId, channelId) {
  openTickets.set(userId, channelId);
}

function closeTicket(userId) {
  openTickets.delete(userId);
}

function entries() {
  return openTickets.entries();
}

module.exports = {
  hasTicket,
  getTicketChannelId,
  registerTicket,
  closeTicket,
  entries,
};
