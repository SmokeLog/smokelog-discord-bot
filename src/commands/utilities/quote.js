/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /quote view & delete
 * -----------------------------------------------------------
 *
 * Description: View or delete saved quotes.
 *              `/quote view` shows a random quote (optionally filtered by user)
 *              `/quote delete` allows staff to delete quotes by ID.
 *              Supports autocomplete for IDs.
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
  getAllQuoteIds,
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

    const focused = interaction.options.getFocused(true);
    const allIds = getAllQuoteIds(interaction.guild.id, interaction.channel.id);

    const filtered = allIds
      .filter((id) => id.includes(focused.value))
      .slice(0, 25)
      .map((id) => ({ name: id, value: id }));

    await interaction.respond(filtered);
  },

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");
    const memberRoles = interaction.member.roles.cache;
    const staffRoleIds = config.STAFF_ROLES;

    if (sub === "view") {
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
          ephemeral: true,
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
          },
          {
            name: "Quote ID",
            value: quote.id,
            inline: false,
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

    if (sub === "delete") {
      const hasStaffRole = staffRoleIds.some((id) => memberRoles.has(id));
      if (!hasStaffRole) {
        return interaction.reply({
          content: "❌ Only staff members can delete quotes.",
          ephemeral: true,
        });
      }

      const quoteId = interaction.options.getString("id");
      const success = deleteQuoteById(quoteId);

      if (!success) {
        return interaction.reply({
          content: `❌ Quote with ID \`${quoteId}\` not found.`,
          ephemeral: true,
        });
      }

      logger.success(
        `🗑️ /quote delete used in #${interaction.channel.name} by ${interaction.user.tag} - deleted quote ${quoteId}`
      );

      return interaction.reply({
        content: `✅ Quote with ID \`${quoteId}\` deleted successfully.`,
        ephemeral: true,
      });
    }
  },
};
