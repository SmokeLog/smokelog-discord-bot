/**
 * -----------------------------------------------------------
 * SmokeLog - Utility: Quote Store (Firestore)
 * -----------------------------------------------------------
 *
 * Description: Stores saved quotes in Firestore for use with
 *              the /quote view and /quote delete subcommands.
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

// Collection path: discord/quotes/{guildId_channelId}/{quoteId}
function getQuotesCollection(guildId, channelId) {
  return db
    .collection("discord")
    .doc("quotes")
    .collection(`${guildId}_${channelId}`);
}

// Save a quote
async function saveQuote(quote) {
  const col = getQuotesCollection(quote.guildId, quote.channelId);
  await col.doc(quote.id).set(quote);
}

// Get a random quote
async function getRandomQuote({ guildId, channelId, userId = null }) {
  const col = getQuotesCollection(guildId, channelId);
  const snapshot = await col.get();

  if (snapshot.empty) return null;

  const filtered = snapshot.docs
    .map((doc) => doc.data())
    .filter((q) => !userId || q.authorId === userId);

  if (!filtered.length) return null;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Delete a quote by ID
async function deleteQuoteById(guildId, channelId, id) {
  const col = getQuotesCollection(guildId, channelId);
  const doc = col.doc(id);
  const exists = await doc.get();
  if (!exists.exists) return false;

  await doc.delete();
  return true;
}

// Get all quotes in a channel (for autocomplete)
async function getAllQuotesInChannel(guildId, channelId) {
  const col = getQuotesCollection(guildId, channelId);
  const snapshot = await col.get();
  return snapshot.docs.map((doc) => doc.data());
}

module.exports = {
  saveQuote,
  getRandomQuote,
  deleteQuoteById,
  getAllQuotesInChannel,
};
