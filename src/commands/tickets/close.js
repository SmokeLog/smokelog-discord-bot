/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /close
 * -----------------------------------------------------------
 *
 * Description: Allows staff to close a ticket channel.
 *              Deletes the channel after 30 seconds.
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
    .setName("close")
    .setDescription("Close the current ticket channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  execute: withStaffCheck(async (interaction) => {
    const channel = interaction.channel;
    const executor = interaction.member.user;

    try {
      await interaction.reply("⏳ This ticket will be closed in 30 seconds...");

      logger.info(
        `Ticket "${channel.name}" scheduled to close in 30s by ${executor.tag}`
      );

      setTimeout(async () => {
        try {
          await channel.delete();
          logger.success(`Ticket "${channel.name}" closed by ${executor.tag}`);
        } catch (err) {
          logger.error(`Failed to delete ticket: ${err.message}`);
        }
      }, 30_000);
    } catch (err) {
      logger.error(`Failed to initiate ticket close: ${err.message}`);
      await interaction.followUp({
        content: "❌ Failed to close the ticket.",
        ephemeral: true,
      });
    }
  }),
};
