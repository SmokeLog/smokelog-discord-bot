/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /quote view & delete
 * -----------------------------------------------------------
 *
 * Description: View or delete saved quotes.
 *              `/quote view` shows a random quote (optionally filtered by user)
 *              `/quote delete` allows staff to delete quotes by ID.
 *              Supports autocomplete with content previews.
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
const config = require("../../config");
const logger = require("../../utils/logger");
const {
  getRandomQuote,
  deleteQuoteById,
  getAllQuotesInChannel,
} = require("../../utils/quoteStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("View or delete saved quotes.")
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
    )
    .addSubcommand((sub) =>
      sub
        .setName("delete")
        .setDescription("Delete a quote by ID (staff only).")
        .addStringOption((opt) =>
          opt
            .setName("id")
            .setDescription("The ID of the quote to delete.")
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction) {
    if (!interaction.isAutocomplete()) return;
    const sub = interaction.options.getSubcommand(false);
    if (sub !== "delete") return;

    const focused = interaction.options.getFocused(true).value.toLowerCase();
    const quotes = await getAllQuotesInChannel(
      interaction.guild.id,
      interaction.channel.id
    );

    const filtered = quotes
      .filter(
        (q) =>
          q.id.toLowerCase().includes(focused) ||
          q.content.toLowerCase().includes(focused)
      )
      .slice(0, 25)
      .map((q) => ({
        name: `${q.content.slice(0, 80)} (${q.id.slice(0, 8)}...)`,
        value: q.id,
      }));

    await interaction.respond(filtered);
  },

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");
    const memberRoles = interaction.member.roles.cache;
    const staffRoleIds = config.STAFF_ROLES;

    if (sub === "view") {
      const quote = await getRandomQuote({
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
        .setAuthor({ name: quote.authorTag || "Unknown User" })
        .setTitle("📌 Saved Quote")
        .setDescription(`"${quote.content || "*No content*"}"`)
        .addFields(
          {
            name: "Quoted by",
            value: `<@${quote.quotedById || "unknown"}>`,
            inline: true,
          },
          {
            name: "Original Message",
            value: `[Jump to message](https://discord.com/channels/${quote.guildId}/${quote.channelId}/${quote.messageId})`,
            inline: true,
          }
        )
        .setFooter({
          text: "SmokeLog Bot",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp(new Date(quote.quotedAt || Date.now()))
        .setColor(0x00b06b);

      if (quote.image) embed.setImage(quote.image);

      logger.success(
        `📌 /quote view used in #${interaction.channel.name} by ${interaction.user.tag} - retrieved quote from ${quote.authorTag}`
      );

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "delete") {
      const hasStaffRole = staffRoleIds.some((id) => memberRoles.has(id));
      if (!hasStaffRole) {
        return interaction.reply({
          content: "❌ Only staff members can delete quotes.",
          flags: 64,
        });
      }

      const quoteId = interaction.options.getString("id");
      const success = await deleteQuoteById(
        interaction.guild.id,
        interaction.channel.id,
        quoteId
      );

      if (!success) {
        return interaction.reply({
          content: `❌ Quote with ID \`${quoteId}\` not found.`,
          flags: 64,
        });
      }

      logger.success(
        `🗑️ /quote delete used in #${interaction.channel.name} by ${interaction.user.tag} - deleted quote ${quoteId}`
      );

      return interaction.reply({
        content: `✅ Quote deleted successfully.`,
        flags: 64,
      });
    }
  },
};
