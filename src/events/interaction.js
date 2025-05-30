/**
 * -----------------------------------------------------------
 * SmokeLog - Slash Command Handler
 * -----------------------------------------------------------
 *
 * Description: Executes registered slash commands when used.
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

const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // ✅ Handle autocomplete interactions
    if (
      interaction.isAutocomplete() &&
      typeof command.autocomplete === "function"
    ) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error("❌ Autocomplete error:", error);
      }
      return;
    }

    // ✅ Handle slash command interactions
    if (interaction.isChatInputCommand()) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error("❌ Command error:", error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "❌ There was an error while executing this command.",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "❌ There was an error while executing this command.",
            ephemeral: true,
          });
        }
      }
    }
  },
};
