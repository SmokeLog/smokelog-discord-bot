/**
 * -----------------------------------------------------------
 * SmokeLog - Deploy Slash Commands
 * -----------------------------------------------------------
 *
 * Description: Registers slash commands with the Discord API
 *              from the /commands folder structure.
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
const { REST, Routes } = require("discord.js");
const config = require("./config");

const globalCommands = [];
const guildCommands = [];

const commandsPath = path.join(__dirname, "commands");
const folders = fs.readdirSync(commandsPath);

for (const folder of folders) {
  const files = fs
    .readdirSync(path.join(commandsPath, folder))
    .filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const command = require(path.join(commandsPath, folder, file));
    if ("data" in command && "execute" in command) {
      if (command.global) {
        globalCommands.push(command.data.toJSON());
      } else {
        guildCommands.push(command.data.toJSON());
      }
    }
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🚨 Clearing existing guild commands...");
    await rest.put(
      Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
      { body: [] }
    );

    console.log("🚨 Clearing existing global commands...");
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), {
      body: [],
    });

    if (guildCommands.length > 0) {
      console.log(`🚀 Deploying ${guildCommands.length} guild command(s)...`);
      await rest.put(
        Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
        { body: guildCommands }
      );
    }

    if (globalCommands.length > 0) {
      console.log(`🌐 Deploying ${globalCommands.length} global command(s)...`);
      await rest.put(Routes.applicationCommands(config.CLIENT_ID), {
        body: globalCommands,
      });
    }

    console.log("✅ Deployment complete.");
  } catch (err) {
    console.error("❌ Failed to deploy commands:", err);
  }
})();
