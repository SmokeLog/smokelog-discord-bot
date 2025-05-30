/**
 * -----------------------------------------------------------
 * SmokeLog - Event: Resources Message
 * -----------------------------------------------------------
 *
 * Description: Sends an introduction embed with a button link
 *              to SmokeLog.org in the #resources channel.
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
const sendEmbedToChannel = require("../../utils/sendEmbedToChannel");

module.exports = {
  name: "post-resources-message",
  once: false,
  async execute(client) {
    const channelId = config.CHANNELS.RESOURCES;
    const botAvatar = client.user.displayAvatarURL();

    const embed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR)
      .setTitle("Discover SmokeLog: Track and Achieve")
      .setDescription(
        `SmokeLog is your personal tool for easily logging and tracking your smoking habits from anywhere. Get real-time insights into your smoking patterns with in-depth statistics, unlock achievements, and compete with others on the leaderboard.\n\nJoin our community today and take control of your smoking journey. Visit [www.smokelog.org](https://www.smokelog.org) to learn more and get started!`
      )
      .setFooter({ text: "Message sent by SmokeLog", iconURL: botAvatar })
      .setTimestamp();

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Visit SmokeLog.org")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.smokelog.org"),
      new ButtonBuilder()
        .setLabel("View GitHub Repository")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/SmokeLog/SmokeLog-Community")
    );

    await sendEmbedToChannel(
      client,
      channelId,
      embed,
      "RESOURCES_INTRO",
      15,
      buttonRow
    );
  },
};
