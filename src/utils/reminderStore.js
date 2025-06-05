/**
 * -----------------------------------------------------------
 * SmokeLog - Reminder Storage Utility (Firestore)
 * -----------------------------------------------------------
 *
 * Description: Handles loading, storing, and scheduling reminders
 *              across restarts using Firebase Firestore.
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

const { v4: uuidv4 } = require("uuid");
const { EmbedBuilder } = require("discord.js");
const logger = require("./logger");
const { db } = require("../lib/firebase");

const activeTimeouts = {};

async function loadReminders(client) {
  try {
    const snapshot = await db
      .collection("discord")
      .doc("reminders")
      .collection("entries")
      .get();
    const reminders = snapshot.docs.map((doc) => doc.data());

    logger.info(`🔁 Loaded ${reminders.length} reminder(s) from Firestore.`);
    reminders.forEach((r) => scheduleSingle(r, client));
  } catch (err) {
    logger.error(`❌ Failed to load reminders from Firestore: ${err.message}`);
  }
}

async function scheduleReminder(reminder, client) {
  reminder.id = reminder.id || uuidv4();

  await db
    .collection("discord")
    .doc("reminders")
    .collection("entries")
    .doc(reminder.id)
    .set(reminder);

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
        await removeReminder(reminder.id);
      } catch (sendErr) {
        logger.error(
          `❌ Failed to send reminder ${reminder.id}: ${sendErr.message}`
        );
      }
    }, delay);

    activeTimeouts[reminder.id] = timeout;
  } catch (err) {
    logger.warn(`⚠️ Could not restore reminder ${reminder.id}: ${err.message}`);

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

async function removeReminder(id) {
  if (activeTimeouts[id]) {
    clearTimeout(activeTimeouts[id]);
    delete activeTimeouts[id];
  }

  await db
    .collection("discord")
    .doc("reminders")
    .collection("entries")
    .doc(id)
    .delete();

  logger.info(`🧼 Removed reminder with ID ${id}`);
}

async function getReminders() {
  const snapshot = await db
    .collection("discord")
    .doc("reminders")
    .collection("entries")
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

module.exports = {
  loadReminders,
  scheduleReminder,
  removeReminder,
  getReminders,
};
