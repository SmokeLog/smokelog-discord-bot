/**
 * -----------------------------------------------------------
 * SmokeLog - Context Menu: Quote
 * -----------------------------------------------------------
 *
 * Description: Quotes a message and saves it for later use
 *              with /quote view. Includes image and link.
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
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");
const { v4: uuidv4 } = require("uuid");

const logger = require("../../utils/logger");
const { saveQuote } = require("../../utils/quoteStore");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Quote")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const message = interaction.targetMessage;

    if (!message || (!message.content && message.attachments.size === 0)) {
      return interaction.reply({
        content: "❌ Cannot quote an empty message.",
        flags: 64,
      });
    }

    const image = message.attachments.find((a) =>
      a.contentType?.startsWith("image/")
    );

    const quote = {
      id: uuidv4(),
      content: message.content || "*[image only]*",
      authorId: message.author.id,
      authorTag: message.author.tag,
      quotedBy: interaction.user.tag,
      quotedById: interaction.user.id,
      guildId: interaction.guild.id,
      channelId: message.channel.id,
      messageId: message.id,
      createdAt: message.createdAt,
      quotedAt: new Date(),
      image: image?.url || null,
    };

    await saveQuote(quote);

    logger.success(
      `📝 ${interaction.user.tag} quoted a message from ${message.author.tag} in #${message.channel.name}`
    );

    const jumpLink = `https://discord.com/channels/${interaction.guild.id}/${message.channel.id}/${message.id}`;

    const embed = new EmbedBuilder()
      .setTitle("📌 Quote Saved")
      .setDescription(
        `${quote.content}\n\n[Jump to Original Message](${jumpLink})`
      )
      .addFields(
        { name: "Quoted User", value: `<@${quote.authorId}>`, inline: true },
        { name: "Saved By", value: `<@${quote.quotedById}>`, inline: true }
      )
      .setColor(0x1e90ff)
      .setFooter({
        text: "SmokeLog Bot",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp(quote.quotedAt);

    if (quote.image) {
      embed.setImage(quote.image);
    }

    return interaction.reply({ embeds: [embed] });
  },
};
