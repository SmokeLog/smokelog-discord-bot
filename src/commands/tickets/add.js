/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /add
 * -----------------------------------------------------------
 *
 * Description: Adds a user to the current ticket channel by
 *              assigning them permissions. Restricted to staff roles.
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
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const logger = require("../../utils/logger");
const withStaffCheck = require("../../utils/withStaffCheck");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a user to the current ticket channel.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add to the ticket.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  execute: withStaffCheck(async (interaction) => {
    const user = interaction.options.getUser("user");
    const channel = interaction.channel;
    const executor = interaction.member.user;

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "❌ This command can only be used in text channels.",
        ephemeral: true,
      });
    }

    try {
      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      await interaction.reply({
        content: `✅ <@${user.id}> has been added to the ticket.`,
      });

      logger.success(
        `🔓 ${executor.username} added ${user.username} to #${channel.name}`
      );
    } catch (err) {
      logger.error(`Failed to add user to ticket: ${err.message}`);
      await interaction.reply({
        content: "❌ Failed to add user to the ticket.",
        ephemeral: true,
      });
    }
  }),
};
