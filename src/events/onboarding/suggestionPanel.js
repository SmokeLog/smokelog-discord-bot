/**
 * -----------------------------------------------------------
 * SmokeLog - Suggestions/Enhancements Panel Message
 * -----------------------------------------------------------
 *
 * Description: Posts a persistent embed in the suggestions-and-enhancements
 *              channel with buttons to submit a suggestion or enhancement.
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

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const config = require("../../config");
const logger = require("../../utils/logger");
const {
  markPosted,
  getPostedMessageId,
  clearPosted,
} = require("../../utils/messageCache");

module.exports = async function postSuggestionPanel(client) {
  const panelKey = "SUGGESTION_PANEL";
  const channel = await client.channels.fetch(config.CHANNELS.SUGGESTIONS);

  const recentMessages = await channel.messages.fetch({ limit: 10 });
  const duplicates = recentMessages.filter(
    (msg) =>
      msg.author.id === client.user.id &&
      msg.embeds?.[0]?.title === "💡 Got a Suggestion or Enhancement?"
  );

  for (const msg of duplicates.values()) {
    try {
      await msg.delete();
      logger.warning(`Deleted old suggestion panel (ID: ${msg.id})`);
    } catch {
      logger.warning(
        `Failed to delete suggestion panel message (ID: ${msg.id})`
      );
    }
  }

  const embed = new EmbedBuilder()
    .setTitle("💡 Got a Suggestion or Enhancement?")
    .setDescription(
      "Help us improve SmokeLog!\nUse the buttons below to submit your idea. A private ticket will be created for review."
    )
    .setColor(config.EMBED_COLOR)
    .setFooter({ text: "SmokeLog Suggestions" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("submitSuggestion")
      .setLabel("📝 Submit Suggestion")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("submitEnhancement")
      .setLabel("⚙️ Submit Enhancement")
      .setStyle(ButtonStyle.Secondary)
  );

  const sent = await channel.send({
    embeds: [embed],
    components: [row],
  });

  markPosted(panelKey, sent.id);
  logger.success(`✅ Posted suggestion panel in #${channel.name}`);
};
