/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /snipe
 * -----------------------------------------------------------
 *
 * Description: Displays the last deleted message in a channel,
 *              including text and optional image attachments.
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

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getSnipe, clearSnipe } = require("../../utils/snipeStore");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("View the last deleted message in this channel.")
    .setDMPermission(false),

  async execute(interaction) {
    const snipe = await getSnipe(interaction.channel.id); // ✅ await here

    if (!snipe) {
      logger.info(
        `❌ /snipe used in #${interaction.channel?.name || "unknown"} by ${
          interaction.user.tag
        } - nothing to snipe.`
      );
      return interaction.reply({
        content: "❌ There's nothing to snipe in this channel!",
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("💬 Deleted Message")
      .setDescription(
        `${snipe.content || "*No content*"}\n\n**Mention:** <@${
          snipe.authorId || "unknown"
        }>`
      )
      .setColor(0x1e90ff)
      .setAuthor({
        name: snipe.authorTag || "Unknown User",
        iconURL: snipe.avatarURL || undefined,
      })
      .setFooter({
        text: "SmokeLog Bot",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp(new Date(snipe.createdAt || Date.now()));

    if (snipe.image) {
      embed.setImage(snipe.image);
    }

    logger.success(
      `📎 /snipe used in #${interaction.channel?.name || "unknown"} by ${
        interaction.user.tag
      } - showing message from ${snipe.authorTag}`
    );

    await clearSnipe(interaction.channel.id); // ✅ await here too

    return interaction.reply({ embeds: [embed] });
  },
};
