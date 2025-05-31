/**
 * -----------------------------------------------------------
 * SmokeLog - Slash & Context Interaction Handler
 * -----------------------------------------------------------
 *
 * Description: Executes slash and context menu commands with
 *              error handling and autocomplete support.
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

const { Events, ApplicationCommandType } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // ✅ Handle autocomplete
    if (
      interaction.isAutocomplete() &&
      typeof command.autocomplete === "function"
    ) {
      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error("❌ Autocomplete Error:", err);
      }
      return;
    }

    // ✅ Handle slash commands
    if (interaction.isChatInputCommand()) {
      return handleExecution(interaction, command, "slash command");
    }

    // ✅ Handle message context menu commands
    if (
      interaction.isMessageContextMenuCommand?.() ||
      interaction.commandType === ApplicationCommandType.Message
    ) {
      return handleExecution(interaction, command, "context menu");
    }

    // You can add user context menu or modal submit handling here as needed.
  },
};

// 🔁 Shared execution handler
async function handleExecution(interaction, command, typeLabel = "command") {
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ ${typeLabel} error:`, error);
    const reply = {
      content: `❌ There was an error while executing this ${typeLabel}.`,
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}
