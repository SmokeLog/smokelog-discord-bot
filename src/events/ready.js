/**
 * -----------------------------------------------------------
 * SmokeLog - Event: Ready
 * -----------------------------------------------------------
 *
 * Description: Fires when the bot is online and ready.
 *              Starts rotating presence and posts a startup
 *              embed to the log channel (once).
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

const { EmbedBuilder } = require("discord.js");

const { startPresenceRotation } = require("../utils/presence");
const logger = require("../utils/logger");
const config = require("../config");
const sendEmbedToChannel = require("../utils/sendEmbedToChannel");
const onboarding = require("../events/onboarding/welcomeMessages");
const resources = require("../events/onboarding/resourcesMessage");
const postSupportPanel = require("../events/onboarding/supportPanel");
const postBugPanel = require("../events/onboarding/bugPanel");
const postSuggestionPanel = require("../events/onboarding/suggestionPanel");
const postVerificationPanel = require("../events/onboarding/verificationPanel");
const { loadReminders } = require("../utils/reminderStore");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    logger.setDiscordClient(client, config.CHANNELS.LOG);
    logger.success(`SmokeLog Bot is online as ${client.user.tag}`);
    startPresenceRotation(client);

    // 🔁 Load and re-schedule reminders
    loadReminders(client);

    const startupEmbed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR)
      .setTitle("✅ SmokeLog Bot is Online")
      .setDescription(
        `The bot has started successfully.\nVersion: \`${config.VERSION}\``
      )
      .setFooter({
        text: "Message sent by SmokeLog",
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await sendEmbedToChannel(
      client,
      config.CHANNELS.LOG,
      startupEmbed,
      "STARTUP_LOG",
      10
    );

    // Run onboarding + panels
    await onboarding.execute(client);
    await resources.execute(client);
    await postSupportPanel(client);
    await postBugPanel(client);
    await postSuggestionPanel(client);
    await postVerificationPanel(client);
  },
};
