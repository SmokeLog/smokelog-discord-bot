/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command: /remindme
 * -----------------------------------------------------------
 *
 * Description: Create, view, and cancel personal reminders.
 *              Supports duration-based (/in), exact date/time
 *              (/on), same-day (/at), list view, and cancel.
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
const ms = require("ms");
const {
  scheduleReminder,
  getReminders,
  removeReminder,
  saveReminders,
} = require("../../utils/reminderStore");
const logger = require("../../utils/logger");

function parse12HourTime(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return null;
  let [_, hourStr, minuteStr, meridiem] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  if (meridiem.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;
  return { hour, minute };
}

function reminderEmbed({ title, description, color = 0x00b06b }, client) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({
      text: "SmokeLog Reminder",
      iconURL: client.user.displayAvatarURL(),
    });
}

function formatTimestamp(ms) {
  const ts = Math.floor(ms / 1000);
  return `<t:${ts}:f> (**<t:${ts}:R>**)`;
}

function handleReminderCreated(interaction, remindAt, message, id, label) {
  return interaction.reply({
    embeds: [
      reminderEmbed(
        {
          title: `${label} Reminder Set!`,
          description: `I'll remind you ${
            label === "⏰" ? "in" : "on"
          } **${message}** at ${formatTimestamp(remindAt)}.`,
        },
        interaction.client
      ),
    ],
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remindme")
    .setDescription("Set a reminder for yourself.")
    .addSubcommand((sub) =>
      sub
        .setName("in")
        .setDescription("Set a reminder after a duration (e.g., 10m, 2h)")
        .addStringOption((opt) =>
          opt
            .setName("duration")
            .setDescription("e.g. 10m, 2h")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("message").setDescription("Reminder message")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("on")
        .setDescription("Set a reminder for a specific date and time")
        .addStringOption((opt) =>
          opt
            .setName("date")
            .setDescription("Date (YYYY-MM-DD)")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("time")
            .setDescription("Time (e.g. 01:30 PM)")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("message").setDescription("Reminder message")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("at")
        .setDescription("Set a reminder at a time today (e.g. 07:00 PM)")
        .addStringOption((opt) =>
          opt
            .setName("time")
            .setDescription("Time (e.g. 07:00 AM)")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("message").setDescription("Reminder message")
        )
    )
    .addSubcommand((sub) =>
      sub.setName("view").setDescription("View your active reminders")
    )
    .addSubcommand((sub) =>
      sub
        .setName("cancel")
        .setDescription("Cancel a reminder by selecting it")
        .addStringOption((opt) =>
          opt
            .setName("reminder")
            .setDescription("Choose a reminder to cancel")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .setDMPermission(true),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const channelId = interaction.channel.id;
    const client = interaction.client;

    if (sub === "in") {
      const duration = interaction.options.getString("duration");
      const message =
        interaction.options.getString("message") || "*No message*";
      const msValue = ms(duration);

      if (!msValue || msValue < 10000) {
        return interaction.reply({
          embeds: [
            reminderEmbed(
              {
                title: "❌ Invalid Duration",
                description: "Minimum is 10 seconds.",
                color: 0xff4c4c,
              },
              client
            ),
          ],
        });
      }

      const remindAt = Date.now() + msValue;
      const id = scheduleReminder(
        { userId, channelId, remindAt, message },
        client
      );
      saveReminders();
      logger.success(
        `⏰ ${interaction.user.tag} set reminder in ${duration} (${id})`
      );

      return handleReminderCreated(interaction, remindAt, duration, id, "⏰");
    }

    if (sub === "on") {
      const dateStr = interaction.options.getString("date");
      const timeStr = interaction.options.getString("time");
      const message =
        interaction.options.getString("message") || "*No message*";
      const parsed = parse12HourTime(timeStr);

      if (!parsed) {
        return interaction.reply({
          embeds: [
            reminderEmbed(
              {
                title: "❌ Invalid Time Format",
                description: "Use `01:30 PM` format.",
                color: 0xff4c4c,
              },
              client
            ),
          ],
        });
      }

      const remindAt = new Date(
        `${dateStr}T${parsed.hour.toString().padStart(2, "0")}:${parsed.minute
          .toString()
          .padStart(2, "0")}:00`
      ).getTime();

      if (isNaN(remindAt) || remindAt <= Date.now()) {
        return interaction.reply({
          embeds: [
            reminderEmbed(
              {
                title: "❌ Invalid Date/Time",
                description: "The time is in the past.",
                color: 0xff4c4c,
              },
              client
            ),
          ],
        });
      }

      const id = scheduleReminder(
        { userId, channelId, remindAt, message },
        client
      );
      saveReminders();
      logger.success(
        `📅 ${interaction.user.tag} set reminder for ${dateStr} ${timeStr} (${id})`
      );

      return handleReminderCreated(
        interaction,
        remindAt,
        `${dateStr} ${timeStr}`,
        id,
        "📅"
      );
    }

    if (sub === "at") {
      const timeStr = interaction.options.getString("time");
      const message =
        interaction.options.getString("message") || "*No message*";
      const parsed = parse12HourTime(timeStr);

      if (!parsed) {
        return interaction.reply({
          embeds: [
            reminderEmbed(
              {
                title: "❌ Invalid Time Format",
                description: "Use `07:00 AM` format.",
                color: 0xff4c4c,
              },
              client
            ),
          ],
        });
      }

      const now = new Date();
      const remindAt = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        parsed.hour,
        parsed.minute,
        0
      ).getTime();

      if (isNaN(remindAt) || remindAt <= Date.now()) {
        return interaction.reply({
          embeds: [
            reminderEmbed(
              {
                title: "❌ Time Passed",
                description: "That time has already passed today.",
                color: 0xff4c4c,
              },
              client
            ),
          ],
        });
      }

      const id = scheduleReminder(
        { userId, channelId, remindAt, message },
        client
      );
      saveReminders();
      logger.success(
        `⏱️ ${interaction.user.tag} set reminder at ${timeStr} today (${id})`
      );

      return handleReminderCreated(interaction, remindAt, timeStr, id, "⏱️");
    }

    if (sub === "view") {
      const userReminders = getReminders().filter((r) => r.userId === userId);
      if (userReminders.length === 0) {
        return interaction.reply({
          embeds: [
            reminderEmbed(
              {
                title: "📭 No Reminders",
                description: "You have no active reminders.",
              },
              client
            ),
          ],
        });
      }

      const formatted = userReminders
        .map(
          (r, i) =>
            `\`${i + 1}.\` <t:${Math.floor(r.remindAt / 1000)}:R> – ${
              r.message
            }`
        )
        .join("\n");

      logger.info(`📋 ${interaction.user.tag} viewed reminders`);
      return interaction.reply({
        embeds: [
          reminderEmbed(
            { title: "📌 Your Reminders", description: formatted },
            client
          ),
        ],
      });
    }

    if (sub === "cancel") {
      const id = interaction.options.getString("reminder");
      const userReminders = getReminders().filter((r) => r.userId === userId);
      const reminder = userReminders.find((r) => r.id === id);

      if (!reminder) {
        return interaction.reply({
          embeds: [
            reminderEmbed(
              {
                title: "❌ Invalid Selection",
                description: "That reminder doesn't exist anymore.",
                color: 0xff4c4c,
              },
              client
            ),
          ],
        });
      }

      const success = removeReminder(reminder.id);
      saveReminders();

      if (success) {
        logger.success(`🗑️ ${interaction.user.tag} cancelled reminder ${id}`);
        return interaction.reply({
          embeds: [
            reminderEmbed(
              {
                title: "✅ Reminder Cancelled",
                description: `Reminder for **${reminder.message}** was cancelled.`,
              },
              client
            ),
          ],
        });
      }

      logger.error(`❌ ${interaction.user.tag} failed to cancel reminder`);
      return interaction.reply({
        embeds: [
          reminderEmbed(
            {
              title: "❌ Failed",
              description: "Could not cancel that reminder.",
              color: 0xff4c4c,
            },
            client
          ),
        ],
      });
    }
  },

  async autocomplete(interaction) {
    const userId = interaction.user.id;

    if (interaction.options.getSubcommand() === "cancel") {
      const reminders = getReminders()
        .filter((r) => r.userId === userId)
        .slice(0, 25);

      const focused = interaction.options.getFocused(true);
      const choices = reminders.map((r) => ({
        name: `${r.message || "*No message*"} – ${new Date(
          r.remindAt
        ).toLocaleString()}`,
        value: r.id,
      }));

      await interaction.respond(
        choices.filter((choice) =>
          choice.name.toLowerCase().includes(focused.value.toLowerCase())
        )
      );
    }
  },
};
