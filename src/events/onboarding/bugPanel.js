/**
 * -----------------------------------------------------------
 * SmokeLog - Bug/Error/Typos Panel Message
 * -----------------------------------------------------------
 *
 * Description: Posts a persistent embed in the bugs-errors-typos
 *              channel with buttons to report a bug, error, or typo.
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
const { markPosted } = require("../../utils/messageCache");

module.exports = async function postBugPanel(client) {
  const panelKey = "BUG_REPORT_PANEL";
  const channel = await client.channels.fetch(config.CHANNELS.BUGS);

  // Post the new panel
  const embed = new EmbedBuilder()
    .setTitle("🐛 Report Bugs, Errors, or Typos")
    .setDescription(
      "Encountered a bug, error message, or noticed a typo?\nUse the buttons below to quickly submit a report. A private ticket will be created for you."
    )
    .setColor(config.EMBED_COLOR)
    .setFooter({
      text: "SmokeLog Bug Reporter",
      iconURL: client.user.displayAvatarURL(),
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("reportBug")
      .setLabel("🐛 Report Bug")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("reportError")
      .setLabel("🚨 Report Error")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("reportTypo")
      .setLabel("✏️ Report Typo")
      .setStyle(ButtonStyle.Primary)
  );

  const sent = await channel.send({
    embeds: [embed],
    components: [row],
  });

  markPosted(panelKey, sent.id);

  // Cleanup: delete old matching messages except the one we just sent
  const recentMessages = await channel.messages.fetch({ limit: 10 });
  const duplicates = recentMessages.filter(
    (msg) =>
      msg.author.id === client.user.id &&
      msg.embeds?.[0]?.title === "🐛 Report Bugs, Errors, or Typos" &&
      msg.id !== sent.id
  );

  for (const msg of duplicates.values()) {
    try {
      await msg.delete();
      logger.warning(`Deleted old bug panel (ID: ${msg.id})`);
    } catch {
      logger.warning(`Failed to delete bug panel message (ID: ${msg.id})`);
    }
  }

  logger.success(`✅ Posted bug panel in #${channel.name}`);
};
