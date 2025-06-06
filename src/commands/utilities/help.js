/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /help
 * -----------------------------------------------------------
 *
 * Description: Displays a categorized help menu showing
 *              all available commands and their usage.
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help and a list of available commands."),

  async execute(interaction) {
    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const embed = new EmbedBuilder()
      .setTitle("🛠️ SmokeLog Help Menu")
      .setDescription(
        "Here are the available commands categorized by function:"
      )
      .addFields(
        {
          name: "📊 Stats & Leaderboards",
          value:
            "`/stats` – View your own or another user's session stats\n" +
            "`/leaderboards overall` – Show the top users overall\n" +
            "`/leaderboards concentrates` – Top concentrate users\n" +
            "`/leaderboards flower` – Top flower users\n" +
            "`/leaderboards carts` – Top cart users",
        },
        {
          name: "🧠 Reminders",
          value:
            "`/remindme in` – Set a reminder in a duration (e.g. 10m)\n" +
            "`/remindme at` – Set a reminder at a time today (e.g. 07:00 PM)\n" +
            "`/remindme on` – Set a reminder on a date & time (e.g. 2025-06-01 at 01:30 PM)\n" +
            "`/remindme view` – View your active reminders\n" +
            "`/remindme cancel` – Cancel an active reminder\n" +
            "`/remindme timezone` – Set your timezone (used for /at and /on)",
        },
        {
          name: "🔍 Message Tools",
          value:
            "`/snipe` – View the most recently deleted message in a channel\n" +
            "`Quote (Right-Click > Apps > Quote)` – Save a message for later, then view it later with `/quote view`",
        }
      )
      .setFooter({
        text: `SmokeLog Bot • ${formatted}`,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setColor(0x00b06b);

    await interaction.reply({
      embeds: [embed],
      flags: 1 << 6,
    });
  },
};
