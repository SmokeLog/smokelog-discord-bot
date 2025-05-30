/**
 * -----------------------------------------------------------
 * SmokeLog - Event: messageDelete
 * -----------------------------------------------------------
 *
 * Description: Captures and stores the last deleted message in
 *              each channel to be retrieved by the /snipe command.
 *              Stores message content and one image (if present).
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

const { Events } = require("discord.js");
const { saveSnipe } = require("../utils/snipeStore");
const logger = require("../utils/logger");

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    const image = message.attachments.find((a) =>
      a.contentType?.startsWith("image/")
    );

    saveSnipe(message.channel.id, {
      content: message.content || "*No content*",
      authorTag: message.author.tag,
      authorId: message.author.id,
      avatarURL: message.author.displayAvatarURL(),
      createdAt: message.createdAt,
      image: image?.url || null,
    });

    logger.info(
      `🗑️ Message deleted in #${message.channel.name} by ${message.author.tag}`
    );
  },
};
