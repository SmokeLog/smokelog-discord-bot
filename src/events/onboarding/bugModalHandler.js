/**
 * -----------------------------------------------------------
 * SmokeLog - Bug/Error/Typo Modal Handler
 * -----------------------------------------------------------
 *
 * Description: Handles bug/error/typo submissions and creates
 *              staff-visible ticket channels with user.
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
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const config = require("../../config");
const logger = require("../../utils/logger");

const validTypes = {
  reportBug: "Bug",
  reportError: "Error",
  reportTypo: "Typo",
};

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction) {
    const { customId } = interaction;

    // Step 1: Show modal
    if (interaction.isButton() && validTypes[customId]) {
      const typeLabel = validTypes[customId];
      logger.info(`Opening ${typeLabel} modal for ${interaction.user.tag}`);

      const modal = new ModalBuilder()
        .setCustomId(`submitBugForm:${customId}`)
        .setTitle(`${typeLabel} Report`);

      const subject = new TextInputBuilder()
        .setCustomId("subject")
        .setLabel("Subject")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const details = new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Describe the issue in detail")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(subject),
        new ActionRowBuilder().addComponents(details)
      );

      return await interaction.showModal(modal);
    }

    // Step 2: Handle modal submission
    if (
      interaction.isModalSubmit() &&
      interaction.customId.startsWith("submitBugForm:")
    ) {
      const [, originButtonId] = interaction.customId.split(":");
      const typeLabel = validTypes[originButtonId] || "Unknown";

      const subject = interaction.fields.getTextInputValue("subject");
      const description = interaction.fields.getTextInputValue("description");
      const user = interaction.user;
      const guild = interaction.guild;
      const suffix = Date.now().toString().slice(-5);
      const sanitizedName = user.username
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const channelName = `report-${typeLabel.toLowerCase()}-${sanitizedName}-${suffix}`;

      const category = guild.channels.cache.get(
        config.CHANNELS.BUG_SUBMISSION_CATEGORY
      );
      const botMember = guild.members.me;

      if (
        !category ||
        !category
          .permissionsFor(botMember)
          ?.has([PermissionsBitField.Flags.ManageChannels])
      ) {
        logger.warning(
          `Missing ManageChannels permission for bug submission category (${config.CHANNELS.BUG_SUBMISSION_CATEGORY})`
        );
        return await interaction.reply({
          content:
            "❌ I don't have permission to create a ticket in the bug submission area. Please contact staff.",
          flags: 64,
        });
      }

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.EmbedLinks,
              PermissionsBitField.Flags.UseApplicationCommands,
              PermissionsBitField.Flags.ManageChannels,
            ],
          },
          ...config.STAFF_ROLES.map((roleId) => ({
            id: roleId,
            allow: [PermissionsBitField.Flags.ViewChannel],
          })),
        ],
      });

      logger.success(
        `Created ${typeLabel.toLowerCase()} ticket "${channelName}" for ${
          user.tag
        }`
      );

      const embed = new EmbedBuilder()
        .setTitle(`📥 New ${typeLabel} Report`)
        .addFields(
          { name: "Ticket Type", value: typeLabel },
          { name: "Subject", value: subject },
          { name: "Description", value: description }
        )
        .setFooter({
          text: `From ${user.tag}`,
          iconURL: user.displayAvatarURL(),
        })
        .setColor(config.EMBED_COLOR)
        .setTimestamp();

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("closeTicket")
          .setLabel("🔒 Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({
        content: `<@${user.id}> <@&${config.STAFF_ROLES.join(">, <@&")}>`,
        embeds: [embed],
        components: [closeButton],
      });

      await interaction.reply({
        content: `✅ Your ${typeLabel.toLowerCase()} report has been created: <#${
          ticketChannel.id
        }>`,
        flags: 64,
      });
    }

    // Step 3: Close ticket
    if (interaction.isButton() && interaction.customId === "closeTicket") {
      const member = interaction.member;
      const isStaff = config.STAFF_ROLES.some((roleId) =>
        member.roles.cache.has(roleId)
      );

      if (!isStaff) {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ You do not have permission to close this ticket.",
            flags: 64,
          });
        }
        return;
      }

      const channel = interaction.channel;

      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.deferUpdate();
        }

        await channel.send("⏳ This ticket will close in 30 seconds...");

        logger.info(
          `Ticket "${channel.name}" scheduled to close in 30s by ${member.user.tag}`
        );

        setTimeout(async () => {
          try {
            await channel.delete();
            logger.success(
              `Ticket "${channel.name}" closed by ${member.user.tag}`
            );
          } catch (err) {
            logger.error(
              `Failed to delete ticket channel after delay: ${err.message}`
            );
          }
        }, 30_000);
      } catch (err) {
        if (err.code !== 10062) {
          logger.error(`Failed to schedule ticket close: ${err.message}`);
        }
      }
    }
  },
};
