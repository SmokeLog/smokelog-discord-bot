/**
 * -----------------------------------------------------------
 * SmokeLog - Logger Utility
 * -----------------------------------------------------------
 *
 * Description: Standardized console logging with colored output
 *              for use across the SmokeLog Discord bot.
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

const chalk = require("chalk");
const { EmbedBuilder } = require("discord.js");

let client = null;
let logChannelId = null;

function setDiscordClient(discordClient, channelId) {
  client = discordClient;
  logChannelId = channelId;
}

const timestamp = () => `[${new Date().toISOString()}]`;

async function sendToChannel(level, message) {
  if (!client || !logChannelId) return;

  try {
    const channel = await client.channels.fetch(logChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(
        level === "error"
          ? 0xff4c4c
          : level === "warning"
          ? 0xffcc00
          : level === "success"
          ? 0x00ff99
          : 0x00b0f4
      )
      .setTitle(`📝 ${level.toUpperCase()} Log`)
      .setDescription("```ansi\n" + message + "\n```")
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Failed to send log to Discord:", err.message);
  }
}

function logToConsole(level, colorFunc, message) {
  const formatted = `${timestamp()} ${colorFunc(
    `[${level.toUpperCase()}]`
  )} ${message}`;
  console.log(formatted);
  sendToChannel(level, message);
}

module.exports = {
  setDiscordClient,
  info: (msg) => logToConsole("info", chalk.blue, msg),
  success: (msg) => logToConsole("success", chalk.green, msg),
  warning: (msg) => logToConsole("warning", chalk.yellow, msg),
  error: (msg) => logToConsole("error", chalk.red, msg),
};
