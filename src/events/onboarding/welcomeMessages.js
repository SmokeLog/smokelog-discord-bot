/**
 * -----------------------------------------------------------
 * SmokeLog - Event: Welcome & Rules Messages
 * -----------------------------------------------------------
 *
 * Description: Sends welcome and rule embeds to the welcome
 *              channel if not already posted. Runs on bot ready.
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

const { EmbedBuilder } = require("discord.js");
const config = require("../../config");
const sendEmbedToChannel = require("../../utils/sendEmbedToChannel");

module.exports = {
  name: "post-welcome-messages",
  once: false,
  async execute(client) {
    const channelId = config.CHANNELS.WELCOME;
    const botAvatar = client.user.displayAvatarURL();

    const welcomeEmbed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR)
      .setTitle("Welcome to the Server!")
      .setDescription(
        `We're excited to have you here! Please make sure to read the rules below and verify yourself to gain full access.`
      )
      .setFooter({ text: "Message sent by SmokeLog", iconURL: botAvatar })
      .setTimestamp();

    const rulesEmbed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR)
      .setTitle("Server Rules")
      .setDescription(
        [
          "1. Be respectful.",
          "2. No spamming.",
          "3. No advertising.",
          "4. Follow Discord's Terms of Service.",
          "5. Have fun and be kind!",
        ].join("\n")
      )
      .setFooter({ text: "Message sent by SmokeLog", iconURL: botAvatar })
      .setTimestamp();

    await sendEmbedToChannel(client, channelId, welcomeEmbed, "WELCOME_EMBED");
    await sendEmbedToChannel(client, channelId, rulesEmbed, "RULES_EMBED");
  },
};
