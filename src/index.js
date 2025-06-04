/**
 * -----------------------------------------------------------
 * SmokeLog - Discord Bot Entry Point
 * -----------------------------------------------------------
 *
 * Description: Initializes and starts the SmokeLog Discord bot.
 *              Loads environment variables, commands, and
 *              connects to the Discord API.
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

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const config = require("./config");
const logger = require("./utils/logger");
const handleError = require("./utils/errorHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Set client for logger embeds
logger.setDiscordClient(client, process.env.LOG_CHANNEL_ID);

const app = express();
app.get("/", (_, res) => res.send("SmokeLog Bot is running."));
app.listen(process.env.PORT || 3000, () => {
  logger.info("Express server running for Railway.");
});

// Load slash commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");

if (fs.existsSync(foldersPath)) {
  const commandFolders = fs.readdirSync(foldersPath);
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(path.join(foldersPath, folder))
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(path.join(foldersPath, folder, file));
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      }
    }
  }
}

// Load event handlers recursively
const loadEvents = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      loadEvents(fullPath);
    } else if (file.name.endsWith(".js")) {
      const event = require(fullPath);
      if (event.name === "error-handlers") {
        event.execute(client);
      } else if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }
};
loadEvents(path.join(__dirname, "events"));

// Startup logs
logger.info(`${config.BOT_NAME} v${config.VERSION} starting...`);
logger.info(`Environment: ${config.ENVIRONMENT}`);

// Login to Discord
client
  .login(process.env.DISCORD_TOKEN)
  .then(() => logger.success("✅ Successfully logged into Discord"))
  .catch((error) => handleError(error, "❌ Failed to log in"));

// Global error handling
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection: " + reason);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception: " + err.stack);
});
