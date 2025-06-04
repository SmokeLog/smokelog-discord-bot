/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /quote view
 * -----------------------------------------------------------
 *
 * Description: View a random quote from a saved message.
 *              Supports filtering by user.
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

const logger = require("../../utils/logger");
const { getRandomQuote } = require("../../utils/quoteStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("View a saved quote.")
    .addSubcommand((sub) =>
      sub
        .setName("view")
        .setDescription("View a random saved quote.")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("Filter by a specific user")
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");

    if (subcommand === "view") {
      const quote = getRandomQuote({
        guildId: interaction.guild.id,
        channelId: interaction.channel.id,
        userId: user?.id,
      });

      if (!quote) {
        logger.info(
          `❌ /quote view used in #${interaction.channel.name} by ${interaction.user.tag} - no quotes found.`
        );
        return interaction.reply({
          content: user
            ? `❌ No quotes found for **${user.tag}**.`
            : "❌ No quotes found.",
          flags: 64,
        });
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          name: quote.authorTag,
        })
        .setTitle("📌 Saved Quote")
        .setDescription(`"${quote.content}"`)
        .addFields(
          { name: "Quoted by", value: `<@${quote.quotedById}>`, inline: true },
          {
            name: "Original Date",
            value: `<t:${Math.floor(
              new Date(quote.createdAt).getTime() / 1000
            )}:F>`,
            inline: true,
          }
        )
        .setFooter({
          text: "SmokeLog Bot",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setColor(0x00b06b);

      logger.success(
        `📌 /quote view used in #${interaction.channel.name} by ${interaction.user.tag} - retrieved quote from ${quote.authorTag}`
      );

      return interaction.reply({ embeds: [embed] });
    }
  },
};
