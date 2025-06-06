/**
 * -----------------------------------------------------------
 * SmokeLog - Slash & Context Interaction Handler
 * -----------------------------------------------------------
 *
 * Description: Executes slash, context menu, and verification
 *              modal interactions with error handling.
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
const handleVerificationModal = require("./onboarding/verificationModalPanel");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // 🔐 Handle verification modal & button interactions
    await handleVerificationModal(interaction);

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
      flags: 64,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}
