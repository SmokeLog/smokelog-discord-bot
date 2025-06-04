/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /remove
 * -----------------------------------------------------------
 *
 * Description: Removes a user from the current ticket channel
 *              by revoking their view/send permissions.
 *              Restricted to staff roles.
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
    .setName("remove")
    .setDescription("Remove a user from the current ticket channel.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove from the ticket.")
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
        flags: 64,
      });
    }

    try {
      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });

      await interaction.reply({
        content: `✅ <@${user.id}> has been removed from the ticket.`,
      });

      logger.success(
        `🔒 ${executor.username} removed ${user.username} from #${channel.name}`
      );
    } catch (err) {
      logger.error(`Failed to remove user from ticket: ${err.message}`);
      await interaction.reply({
        content: "❌ Failed to remove user from the ticket.",
        flags: 64,
      });
    }
  }),
};
