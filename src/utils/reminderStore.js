/**
 * -----------------------------------------------------------
 * SmokeLog - Reminder Storage Utility
 * -----------------------------------------------------------
 *
 * Description: Handles loading, storing, and scheduling reminders
 *              across restarts using a local JSON file.
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

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { EmbedBuilder } = require("discord.js");
const logger = require("./logger");

const filePath = path.resolve("data", "reminders.json");
let reminders = [];
const activeTimeouts = {}; // 🧠 Track timeout IDs

function loadReminders(client) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    try {
      reminders = JSON.parse(data);
      logger.info(`🔁 Loaded ${reminders.length} reminder(s) from disk.`);
      scheduleReminders(client);
    } catch (err) {
      logger.error(`❌ Failed to parse reminders.json: ${err.message}`);
    }
  }
}

function saveReminders() {
  fs.writeFileSync(filePath, JSON.stringify(reminders, null, 2));
}

function addReminder(reminder, client) {
  reminder.id = reminder.id || uuidv4();
  reminders.push(reminder);
  saveReminders();

  logger.success(
    `⏰ Reminder set for ${reminder.userId} in ${
      reminder.channelId
    } at ${new Date(reminder.remindAt).toISOString()} (ID: ${reminder.id})`
  );

  scheduleSingle(reminder, client);
}

async function scheduleSingle(reminder, client) {
  const delay = reminder.remindAt - Date.now();
  if (delay < 0) return;

  try {
    const channel = await client.channels.fetch(reminder.channelId);
    if (!channel) throw new Error("Channel not found");

    const timeout = setTimeout(async () => {
      try {
        const embed = new EmbedBuilder()
          .setTitle("⏰ Reminder!")
          .setDescription(
            `<@${reminder.userId}> ${
              reminder.message || "*No message provided*"
            }`
          )
          .setColor(0xfee75c);

        await channel.send({ embeds: [embed] });
        logger.success(
          `🔔 Reminder delivered to ${reminder.userId} in ${reminder.channelId} (ID: ${reminder.id})`
        );
        removeReminder(reminder.id);
      } catch (sendErr) {
        logger.error(
          `❌ Failed to send reminder ${reminder.id}: ${sendErr.message}`
        );
      }
    }, delay);

    activeTimeouts[reminder.id] = timeout;
  } catch (err) {
    logger.warn(`⚠️ Could not restore reminder ${reminder.id}: ${err.message}`);

    // Notify the user if possible
    try {
      const user = await client.users.fetch(reminder.userId);
      if (user) {
        await user.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("⚠️ Reminder Could Not Be Restored")
              .setDescription(
                `One of your reminders could not be reloaded.\n\n**Reason:** ${
                  err.message
                }\n**Reminder:** ${
                  reminder.message || "*No message*"
                }\n**Originally scheduled for:** <t:${Math.floor(
                  reminder.remindAt / 1000
                )}:f>`
              )
              .setColor(0xffcc00),
          ],
        });
      }
    } catch (userErr) {
      logger.warn(
        `⚠️ Could not notify user ${reminder.userId}: ${userErr.message}`
      );
    }
  }
}

function removeReminder(id) {
  // 🧹 Clear timeout if it exists
  if (activeTimeouts[id]) {
    clearTimeout(activeTimeouts[id]);
    delete activeTimeouts[id];
  }

  const initial = reminders.length;
  reminders = reminders.filter((r) => r.id !== id);
  saveReminders();
  return reminders.length < initial;
}

function getReminders() {
  return reminders;
}

function scheduleReminders(client) {
  reminders.forEach((r) => scheduleSingle(r, client));
}

module.exports = {
  loadReminders,
  scheduleReminder: addReminder,
  removeReminder,
  getReminders,
  saveReminders,
};
