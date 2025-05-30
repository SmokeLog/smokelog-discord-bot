/**
 * -----------------------------------------------------------
 * SmokeLog - Support Panel Message
 * -----------------------------------------------------------
 *
 * Description: Posts the persistent support embed in the
 *              #support channel with a button to trigger
 *              a private support request modal.
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

module.exports = async function postSupportPanel(client) {
  const panelKey = "SUPPORT_PANEL";
  const channel = await client.channels.fetch(config.CHANNELS.SUPPORT);

  // Fetch and inspect recent messages
  const recentMessages = await channel.messages.fetch({ limit: 10 });

  // Look for previous panel embed by title
  const duplicates = recentMessages.filter(
    (msg) =>
      msg.author.id === client.user.id &&
      msg.embeds?.[0]?.title === "🛠️ Need Help?"
  );

  for (const msg of duplicates.values()) {
    try {
      await msg.delete();
      logger.warning(`Deleted old support panel (ID: ${msg.id})`);
    } catch {
      logger.warning(`Failed to delete support panel message (ID: ${msg.id})`);
    }
  }

  // Build fresh embed + button
  const embed = new EmbedBuilder()
    .setTitle("🛠️ Need Help?")
    .setDescription(
      "Click the button below to submit a private support request. A staff member will follow up in a private channel."
    )
    .setColor(config.EMBED_COLOR)
    .setFooter({ text: "Support powered by SmokeLog" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("openSupportModal")
      .setLabel("📝 Submit a Support Request")
      .setStyle(ButtonStyle.Primary)
  );

  const sent = await channel.send({
    embeds: [embed],
    components: [row],
  });

  markPosted(panelKey, sent.id);
  logger.success(`✅ Posted fresh support panel in #${channel.name}`);
};
