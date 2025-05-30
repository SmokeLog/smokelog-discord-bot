/**
 * -----------------------------------------------------------
 * SmokeLog - Event: Announcement Relay
 * -----------------------------------------------------------
 *
 * Description: Reposts messages from authorized users in the
 *              #announcements channel as embeds and deletes
 *              the original message.
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

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Only allow configured DEV_IDS to trigger this
    if (!config.DEV_IDS.includes(message.author.id)) return;

    // Only trigger in the #announcements channel
    if (message.channel.id !== config.CHANNELS.ANNOUNCEMENTS) return;

    const embed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR)
      .setDescription(message.content)
      .setFooter({
        text: `Announcement by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    // Send as bot embed
    await message.channel.send({ embeds: [embed] });

    // Delete original message
    await message
      .delete()
      .catch((err) => console.error("Failed to delete announcement:", err));
  },
};
