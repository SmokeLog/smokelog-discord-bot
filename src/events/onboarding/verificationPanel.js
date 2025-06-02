/**
 * -----------------------------------------------------------
 * SmokeLog - Verification Panel Message
 * -----------------------------------------------------------
 *
 * Description: Posts a persistent verification embed in the
 *              #click-to-verify channel with a button to enter
 *              a code from the website.
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

module.exports = async function postVerificationPanel(client) {
  const panelKey = "VERIFICATION_PANEL";
  const channel = await client.channels.fetch(config.CHANNELS.VERIFY);

  const recentMessages = await channel.messages.fetch({ limit: 10 });

  const duplicates = recentMessages.filter(
    (msg) =>
      msg.author.id === client.user.id &&
      msg.embeds?.[0]?.title === "🔐 Discord Verification"
  );

  for (const msg of duplicates.values()) {
    try {
      await msg.delete();
      logger.warning(`Deleted old verification panel (ID: ${msg.id})`);
    } catch {
      logger.warning(
        `Failed to delete verification panel message (ID: ${msg.id})`
      );
    }
  }

  const embed = new EmbedBuilder()
    .setTitle("🔐 Discord Verification")
    .setDescription(
      "Click the button below and enter your verification code from the [SmokeLog website](https://www.smokelog.org/discord) to verify your Discord account."
    )
    .setColor(config.EMBED_COLOR)
    .setFooter({ text: "Verification powered by SmokeLog" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("openVerificationModal")
      .setLabel("✅ Verify Now")
      .setStyle(ButtonStyle.Success)
  );

  const sent = await channel.send({
    embeds: [embed],
    components: [row],
  });

  logger.success(`✅ Posted verification panel in #${channel.name}`);
};
