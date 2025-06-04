/**
 * -----------------------------------------------------------
 * SmokeLog - Utility: Quote Store
 * -----------------------------------------------------------
 *
 * Description: Stores saved quotes for use with the
 *              /quote view and /quote delete subcommands.
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

const fs = require("fs");
const path = require("path");

const QUOTES_PATH = path.join(__dirname, "../../data/quotes.json");

let quotes = [];

// Load from JSON at startup
function loadQuotes() {
  try {
    if (fs.existsSync(QUOTES_PATH)) {
      const data = fs.readFileSync(QUOTES_PATH, "utf8");
      quotes = JSON.parse(data);
    } else {
      quotes = [];
    }
  } catch (err) {
    console.error(`Failed to load quotes: ${err.message}`);
    quotes = [];
  }
}

// Save quotes to JSON
function saveQuotesToFile() {
  try {
    fs.writeFileSync(QUOTES_PATH, JSON.stringify(quotes, null, 2), "utf8");
  } catch (err) {
    console.error(`Failed to write quotes: ${err.message}`);
  }
}

// Save a new quote
function saveQuote(quote) {
  quotes.push(quote);
  saveQuotesToFile();
}

// Get a random quote (with optional user filter)
function getRandomQuote({ guildId, channelId, userId = null }) {
  const filtered = quotes.filter(
    (q) =>
      q.guildId === guildId &&
      q.channelId === channelId &&
      (!userId || q.authorId === userId)
  );

  if (!filtered.length) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Delete a quote by its ID
function deleteQuoteById(id) {
  const index = quotes.findIndex((q) => q.id === id);
  if (index === -1) return false;

  quotes.splice(index, 1);
  saveQuotesToFile();
  return true;
}

// Get all quote IDs for a specific channel (used in autocomplete)
function getAllQuoteIds(guildId, channelId) {
  return quotes
    .filter((q) => q.guildId === guildId && q.channelId === channelId)
    .map((q) => q.id);
}

// Init on import
loadQuotes();

module.exports = {
  saveQuote,
  getRandomQuote,
  deleteQuoteById,
  getAllQuoteIds,
};
